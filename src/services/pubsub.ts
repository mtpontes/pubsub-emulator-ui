import axios from 'axios';

export interface Topic {
    name: string;
    labels?: Record<string, string>;
}

export interface Subscription {
    name: string;
    topic: string;
    pushConfig?: any;
    ackDeadlineSeconds?: number;
}

export interface PubsubMessage {
    data: string; // base64
    attributes?: Record<string, string>;
    messageId: string;
    publishTime: string;
}

export interface ReceivedMessage {
    ackId: string;
    message: PubsubMessage;
}

const api = axios.create({
    baseURL: '/v1',
});

export const PubSubService = {
    // Topics
    async listTopics(projectId: string): Promise<Topic[]> {
        const response = await api.get(`/projects/${projectId}/topics`);
        return response.data.topics || [];
    },

    async createTopic(projectId: string, topicId: string): Promise<Topic> {
        const response = await api.put(`/projects/${projectId}/topics/${topicId}`);
        return response.data;
    },

    async deleteTopic(name: string): Promise<void> {
        await api.delete(`/${name}`);
    },

    async publishMessage(topicName: string, data: any, attributes: Record<string, string> = {}): Promise<string> {
        const base64Data = btoa(typeof data === 'string' ? data : JSON.stringify(data));
        const response = await api.post(`/${topicName}:publish`, {
            messages: [{
                data: base64Data,
                attributes,
            }],
        });
        return response.data.messageIds[0];
    },

    // Subscriptions
    async listSubscriptions(projectId: string): Promise<Subscription[]> {
        const response = await api.get(`/projects/${projectId}/subscriptions`);
        return response.data.subscriptions || [];
    },

    async listTopicSubscriptions(topicName: string): Promise<string[]> {
        const response = await api.get(`/${topicName}/subscriptions`);
        return response.data.subscriptions || [];
    },

    async createSubscription(projectId: string, subId: string, topicName: string, ackDeadlineSeconds = 10): Promise<Subscription> {
        const response = await api.put(`/projects/${projectId}/subscriptions/${subId}`, {
            topic: topicName,
            ackDeadlineSeconds,
        });
        return response.data;
    },

    async deleteSubscription(name: string): Promise<void> {
        await api.delete(`/${name}`);
    },

    async pullMessages(subName: string, maxMessages = 10): Promise<ReceivedMessage[]> {
        const response = await api.post(`/${subName}:pull`, {
            returnImmediately: true,
            maxMessages,
        });
        return response.data.receivedMessages || [];
    },

    async acknowledge(subName: string, ackIds: string[]): Promise<void> {
        await api.post(`/${subName}:acknowledge`, {
            ackIds,
        });
    },

    // Helper to decode message data
    decodeData(data: string): string {
        try {
            return atob(data);
        } catch (e) {
            return data;
        }
    }
};
