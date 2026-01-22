import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { PubSubService } from '../services/pubsub';

interface PublisherProps {
    topicName: string;
}

export const Publisher: React.FC<PublisherProps> = ({ topicName }) => {
    const [data, setData] = useState('');
    const [attributes, setAttributes] = useState('{}');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handlePublish = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const parsedAttrs = JSON.parse(attributes);
            const messageId = await PubSubService.publishMessage(topicName, data, parsedAttrs);
            setStatus({ type: 'success', message: `Published! ID: ${messageId}` });
            setData('');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Card" style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Publish Message</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data (String or JSON)</label>
                    <textarea
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder='{"hello": "world"}'
                        style={{ width: '100%', height: '80px', marginTop: '0.25rem' }}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attributes (JSON)</label>
                    <input
                        value={attributes}
                        onChange={(e) => setAttributes(e.target.value)}
                        placeholder='{"key": "value"}'
                        style={{ width: '100%', marginTop: '0.25rem' }}
                    />
                </div>
                <button
                    className="Button Button-Primary"
                    onClick={handlePublish}
                    disabled={loading || !data}
                    style={{ alignSelf: 'flex-start' }}
                >
                    {loading ? 'Publishing...' : <><Send size={16} /> Publish</>}
                </button>
                {status && (
                    <div style={{
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: status.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
};
