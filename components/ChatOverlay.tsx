import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ChatMessage, chatService } from '../src/services/ChatService';
import { elevenLabsService } from '../src/services/ElevenLabsService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ChatOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [isSupportLoading, setIsSupportLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initial welcome message
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                text: "Hi! I'm your MBTA Assistant. Ask me about train times like 'Next train to Alewife'.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        }

        // Network listener
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const responseText = await chatService.sendMessage(userMsg.text);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            // Error handled in service, but fallback here
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an unexpected error.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button (FAB) */}
            {!isVisible && (
                <TouchableOpacity
                    style={[styles.fab, isOffline && styles.fabOffline]}
                    onPress={() => setIsVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chatbubbles" size={28} color="white" />
                    {isOffline && (
                        <View style={styles.fabBadge}>
                            <Ionicons name="cloud-offline" size={10} color="white" />
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {/* Chat Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <Ionicons name="chatbubbles-outline" size={24} color="#1C345F" />
                                <Text style={styles.headerTitle}>MBTA Assistant</Text>
                            </View>

                            <View style={styles.headerControls}>
                                {isOffline && (
                                    <View style={styles.offlineBadge}>
                                        <Ionicons name="cloud-offline" size={12} color="white" />
                                        <Text style={styles.offlineText}>Offline</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (isSupportLoading) return;
                                        setIsSupportLoading(true);
                                        try {
                                            await elevenLabsService.playSupportMessage();
                                        } finally {
                                            setIsSupportLoading(false);
                                        }
                                    }}
                                    style={styles.supportBadge}
                                >
                                    {isSupportLoading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="headset" size={12} color="white" />
                                            <Text style={styles.supportText}>Call Support</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.messageList}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.messageBubble,
                                    item.sender === 'user' ? styles.userBubble : styles.botBubble
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        item.sender === 'user' ? styles.userText : styles.botText
                                    ]}>{item.text}</Text>
                                </View>
                            )}
                        />

                        {/* Input Area */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                            style={styles.inputContainer}
                        >
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Next train to South Station..."
                                placeholderTextColor="#999"
                                returnKeyType="send"
                                onSubmitEditing={sendMessage}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                onPress={sendMessage}
                                disabled={!inputText.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Ionicons name="send" size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 90, // Above the tab bar (approx 65px + padding)
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1C345F', // MBTA Navy
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    fabOffline: {
        backgroundColor: '#F2A900', // Amber warning color
    },
    fabBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#DA291C', // Red line color
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: SCREEN_HEIGHT * 0.8, // Take up 80% screen height
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C345F',
    },
    headerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    closeButton: {
        padding: 4,
    },
    offlineBadge: {
        backgroundColor: '#F2A900',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    offlineText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    supportBadge: {
        backgroundColor: '#007A33', // MBTA Green Line color (Customer Support feels "safe/go")
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    supportText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    messageList: {
        padding: 16,
        gap: 12,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#1C345F',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userText: {
        color: 'white',
    },
    botText: {
        color: '#333',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
        gap: 10,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16, // Safe area padding
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#1C345F',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
