import { useState, useEffect } from 'react';
import { Database, Send, Inbox, RefreshCw, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PubSubService } from './services/pubsub';
import type { Topic, Subscription } from './services/pubsub';
import { Publisher } from './components/Publisher';
import { Subscriber } from './components/Subscriber';
import './index.css';

function App() {
  const [projectId, setProjectId] = useState('test-project');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'topics' | 'subscriptions'>('topics');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([
        PubSubService.listTopics(projectId),
        PubSubService.listSubscriptions(projectId)
      ]);
      setTopics(t);
      setSubscriptions(s);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data from emulator');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateTopic = async () => {
    const topicId = prompt('Enter Topic ID:');
    if (!topicId) return;

    // Normalize topic ID (handle if user enters full path)
    const finalTopicId = topicId.includes('/') ? topicId.split('/').pop() : topicId;
    if (!finalTopicId) return;

    try {
      await PubSubService.createTopic(projectId, finalTopicId);
      fetchData();
    } catch (err: any) {
      alert('Error creating topic: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleCreateSubscription = async () => {
    const subId = prompt('Enter Subscription ID:');
    if (!subId) return;

    let topicName = '';
    if (topics.length > 0) {
      const topicList = topics.map((t, i) => `${i + 1}. ${t.name.split('/').pop()}`).join('\n');
      const choice = prompt(`Select a topic by number or enter full topic name:\n${topicList}`);
      if (!choice) return;

      const index = parseInt(choice) - 1;
      if (!isNaN(index) && topics[index]) {
        topicName = topics[index].name;
      } else {
        topicName = choice;
      }
    } else {
      topicName = prompt('Enter Topic Name (full path or ID):') || '';
    }

    if (!topicName) return;

    // Ensure topic name is full path
    const fullTopicName = topicName.startsWith('projects/')
      ? topicName
      : `projects/${projectId}/topics/${topicName}`;

    try {
      await PubSubService.createSubscription(projectId, subId, fullTopicName);
      fetchData();
    } catch (err: any) {
      alert('Error creating subscription: ' + (err.response?.data?.error?.message || err.message));
    }
  };


  const handleDeleteTopic = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete topic ${name}?`)) return;
    try {
      await PubSubService.deleteTopic(name);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteSubscription = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete subscription ${name}?`)) return;
    try {
      await PubSubService.deleteSubscription(name);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  return (
    <div className="App">
      <nav className="Navbar">
        <div className="Logo">
          <Database size={24} />
          <span>Pub/Sub Emulator Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Project ID"
              style={{ width: '200px' }}
            />
          </div>
          <button className="Button Button-Outline" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </nav>

      <main className="Container">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`Button ${view === 'topics' ? 'Button-Primary' : 'Button-Outline'}`}
            onClick={() => { setView('topics'); setExpandedItem(null); }}
          >
            <Send size={18} /> Topics
          </button>
          <button
            className={`Button ${view === 'subscriptions' ? 'Button-Primary' : 'Button-Outline'}`}
            onClick={() => { setView('subscriptions'); setExpandedItem(null); }}
          >
            <Inbox size={18} /> Subscriptions
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="Card"
            style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <strong>Error connecting to emulator:</strong> {error}
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Make sure the emulator is running at the configured port</p>
          </motion.div>
        )}

        {view === 'topics' ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>Topics</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage your message streams</p>
              </div>
              <button className="Button Button-Primary" onClick={handleCreateTopic}>
                <Plus size={18} /> Create Topic
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topics.map(topic => (
                <div key={topic.name}>
                  <div
                    className="Card"
                    style={{
                      marginBottom: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: expandedItem === topic.name ? 'rgba(56, 189, 248, 0.05)' : 'var(--panel-bg)'
                    }}
                    onClick={() => toggleExpand(topic.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {expandedItem === topic.name ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <div>
                        <h3 style={{ fontSize: '1rem' }}>{topic.name.split('/').pop()}</h3>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{topic.name}</code>
                      </div>
                    </div>
                    <button className="Button Button-Outline" onClick={(e) => handleDeleteTopic(e, topic.name)}>
                      <Trash2 size={16} color="var(--danger-color)" />
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedItem === topic.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
                          <Publisher topicName={topic.name} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {topics.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <Send size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No topics found. Create one to get started.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem' }}>Subscriptions</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Consume messages from topics</p>
              </div>
              <button className="Button Button-Primary" onClick={handleCreateSubscription}>
                <Plus size={18} /> Create Subscription
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subscriptions.map(sub => (
                <div key={sub.name}>
                  <div
                    className="Card"
                    style={{
                      marginBottom: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: expandedItem === sub.name ? 'rgba(56, 189, 248, 0.05)' : 'var(--panel-bg)'
                    }}
                    onClick={() => toggleExpand(sub.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {expandedItem === sub.name ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <div>
                        <h3 style={{ fontSize: '1rem' }}>{sub.name.split('/').pop()}</h3>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          <strong>Topic:</strong> {sub.topic.split('/').pop()}
                        </div>
                      </div>
                    </div>
                    <button className="Button Button-Outline" onClick={(e) => handleDeleteSubscription(e, sub.name)}>
                      <Trash2 size={16} color="var(--danger-color)" />
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedItem === sub.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
                          <Subscriber subName={sub.name} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {subscriptions.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <Inbox size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No subscriptions found. Create one to start pulling messages.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
        Google Pub/Sub Emulator Admin • Local Development Tool
      </footer>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
