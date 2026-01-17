import NetInfo from '@react-native-community/netinfo';
import { AlertCircle, MessageCircle, Wifi, WifiOff, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { mbtaKnowledgeBase } from '../../services/mbtaKnowledgeBase';
import { initDB, loadData, saveData } from '../../services/offlineStorage';
import { findRelevantInfo, generateResponse } from '../../services/ragEngine';

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [storageSize, setStorageSize] = useState(0);
    const scrollViewRef = useRef(null);

    // Monitor online/offline status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(!!state.isConnected);
        });

        // Initial check
        NetInfo.fetch().then(state => {
            setIsOnline(!!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    // Initialize Storage and load data
    useEffect(() => {
        const initializeData = async () => {
            try {
                await initDB();
                const cachedData = await loadData('mbta_knowledge');

                if (cachedData) {
                    setDataLoaded(true);
                    setMessages([{
                        role: 'assistant',
                        content: '✓ MBTA data loaded from cache! I\'m ready to help offline.'
                    }]);
                } else {
                    // First time - save data
                    await saveData('mbta_knowledge', mbtaKnowledgeBase);
                    setDataLoaded(true);
                    setMessages([{
                        role: 'assistant',
                        content: '✓ MBTA transit data loaded! I can help with routes, transfers, and directions - even offline!'
                    }]);
                }

                // Calculate storage size (approximate for JS object)
                const size = JSON.stringify(mbtaKnowledgeBase).length;
                setStorageSize((size / 1024).toFixed(1));
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const currentInput = input;
        setInput('');

        // Scroll to bottom
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        setTimeout(() => {
            const relevantContext = findRelevantInfo(currentInput);
            const response = generateResponse(currentInput, relevantContext);

            const assistantMsg = {
                role: 'assistant',
                content: response,
                offline: !isOnline
            };

            setMessages(prev => [...prev, assistantMsg]);
            setLoading(false);

            // Scroll to bottom again
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 300);
    };

    if (!isOpen) {
        return (
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                style={styles.floatingButton}
                activeOpacity={0.8}
            >
                <MessageCircle color="white" size={32} />
            </TouchableOpacity>
        );
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isOpen}
            onRequestClose={() => setIsOpen(false)}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <MessageCircle color="white" size={24} />
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>MBTA Assistant</Text>
                                <Text style={styles.headerSubtitle}>Works offline</Text>
                            </View>
                        </View>
                        <View style={styles.headerControls}>
                            {isOnline ?
                                <Wifi color="white" size={16} /> :
                                <WifiOff color="white" size={16} />
                            }
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                            >
                                <X color="white" size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        style={styles.messagesContainer}
                        ref={scrollViewRef}
                        contentContainerStyle={styles.messagesContent}
                    >
                        {messages.map((msg, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.messageBubble,
                                    msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                                ]}
                            >
                                <Text style={[
                                    styles.messageText,
                                    msg.role === 'user' ? styles.userText : styles.assistantText
                                ]}>
                                    {msg.content}
                                </Text>
                                {msg.offline && (
                                    <View style={styles.offlineIndicator}>
                                        <WifiOff color="#666" size={12} />
                                        <Text style={styles.offlineText}>Offline response</Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {loading && (
                            <View style={[styles.messageBubble, styles.assistantBubble]}>
                                <ActivityIndicator size="small" color="#2563eb" />
                            </View>
                        )}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        {!isOnline && (
                            <View style={styles.offlineBanner}>
                                <AlertCircle color="#92400e" size={14} />
                                <Text style={styles.offlineBannerText}>Offline mode - using cached data</Text>
                            </View>
                        )}

                        <View style={styles.inputRow}>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Ask about routes, transfers..."
                                style={styles.input}
                                editable={dataLoaded}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!input.trim() || loading || !dataLoaded}
                                style={[
                                    styles.sendButton,
                                    (!input.trim() || loading || !dataLoaded) && styles.disabledButton
                                ]}
                            >
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {dataLoaded ? `KB Size: ${storageSize}KB` : 'Loading data...'}
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 50,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#2563eb', // blue-600
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTextContainer: {
        marginLeft: 8,
    },
    headerTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    headerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    closeButton: {
        padding: 4,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#f9fafb', // gray-50
    },
    messagesContent: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#2563eb',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: 'white',
    },
    assistantText: {
        color: '#1f2937', // gray-800
    },
    offlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 4,
    },
    offlineText: {
        fontSize: 10,
        color: '#4b5563',
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: 'white',
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb', // amber-50
        borderColor: '#fcd34d', // amber-300
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        marginBottom: 12,
        gap: 8,
    },
    offlineBannerText: {
        color: '#92400e', // amber-800
        fontSize: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#93c5fd', // blue-300
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    footerText: {
        fontSize: 10,
        color: '#9ca3af',
    }
});

export default ChatBot;