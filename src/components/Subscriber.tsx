import React, { useState } from 'react';
import { Download, CheckCheck, Trash2 } from 'lucide-react';
import { PubSubService } from '../services/pubsub';
import type { ReceivedMessage } from '../services/pubsub';

interface SubscriberProps {
    subName: string;
}

export const Subscriber: React.FC<SubscriberProps> = ({ subName }) => {
    const [messages, setMessages] = useState<ReceivedMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const handlePull = async () => {
        setLoading(true);
        try {
            const msgs = await PubSubService.pullMessages(subName);
            setMessages(prev => [...msgs, ...prev].slice(0, 50)); // Keep last 50
        } catch (err: any) {
            alert('Pull error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAck = async (ackId: string) => {
        try {
            await PubSubService.acknowledge(subName, [ackId]);
            setMessages(messages.filter(m => m.ackId !== ackId));
        } catch (err: any) {
            alert('Ack error: ' + err.message);
        }
    };

    const clearMessages = () => setMessages([]);

    return (
        <div className="Card" style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Pulled Messages</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="Button Button-Outline" onClick={clearMessages} title="Clear view">
                        <Trash2 size={16} />
                    </button>
                    <button className="Button Button-Primary" onClick={handlePull} disabled={loading}>
                        <Download size={16} /> {loading ? 'Pulling...' : 'Pull'}
                    </button>
                </div>
            </div>

            <div className="Message-List">
                {messages.map((m, i) => (
                    <div key={m.ackId || i} className="Message-Item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <span>ID: {m.message.messageId}</span>
                            <span>{new Date(m.message.publishTime).toLocaleString()}</span>
                        </div>
                        <pre className="Code-Block">
                            {PubSubService.decodeData(m.message.data)}
                        </pre>
                        {m.message.attributes && Object.keys(m.message.attributes).length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Attributes:</span>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    {Object.entries(m.message.attributes).map(([k, v]) => (
                                        <span key={k} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                            {k}: {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="Button Button-Outline"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => handleAck(m.ackId)}
                            >
                                <CheckCheck size={14} /> Ack
                            </button>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No messages pulled yet.</p>}
            </div>
        </div>
    );
};
