/**
 * Chat Interface Component
 * LLM chat for navigation queries
 */

import { MBTA_COLORS } from '@/constants/Colors';
import type { Message } from '@/src/hooks/useCactusLLM';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    isGenerating: boolean;
    placeholder?: string;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function ChatInterface({
    messages,
    onSendMessage,
    isLoading,
    isGenerating,
    placeholder = "Ask for directions...",
    collapsed = false,
    onToggleCollapse,
}: ChatInterfaceProps) {
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = () => {
        if (inputText.trim() && !isGenerating) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    // Quick suggestions for common queries
    const suggestions = [
        "Where is the Red Line?",
        "How do I exit?",
        "Find Green Line",
        "Transfer to Orange Line",
    ];

    if (collapsed) {
        return (
            <TouchableOpacity
                style={styles.collapsedContainer}
                onPress={onToggleCollapse}
                activeOpacity={0.8}
            >
                <View style={styles.collapsedContent}>
                    <FontAwesome name="comments" size={18} color="#FFF" />
                    <Text style={styles.collapsedText}>Ask AI for directions</Text>
                    <FontAwesome name="chevron-up" size={14} color="rgba(255,255,255,0.6)" />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            {/* Header with collapse button */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🤖 AI Navigation Assistant</Text>
                {onToggleCollapse && (
                    <TouchableOpacity onPress={onToggleCollapse} style={styles.collapseButton}>
                        <FontAwesome name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            Ask me how to navigate! For example:
                        </Text>
                        <View style={styles.suggestionsContainer}>
                            {suggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionChip}
                                    onPress={() => onSendMessage(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <>
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageBubble,
                                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                ]}
                            >
                                <Text style={[
                                    styles.messageText,
                                    message.role === 'user' && styles.userMessageText,
                                ]}>
                                    {message.text}
                                </Text>
                                {message.direction && message.role === 'assistant' && (
                                    <View style={styles.directionBadge}>
                                        <FontAwesome
                                            name={getDirectionIcon(message.direction)}
                                            size={12}
                                            color={MBTA_COLORS.green}
                                        />
                                        <Text style={styles.directionText}>
                                            {message.direction.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        {isGenerating && (
                            <View style={[styles.messageBubble, styles.assistantBubble]}>
                                <ActivityIndicator size="small" color={MBTA_COLORS.green} />
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!inputText.trim() || isGenerating) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || isGenerating}
                >
                    {isGenerating ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <FontAwesome name="send" size={16} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

function getDirectionIcon(direction: string): React.ComponentProps<typeof FontAwesome>['name'] {
    const iconMap: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
        'left': 'arrow-left',
        'right': 'arrow-right',
        'up': 'arrow-up',
        'down': 'arrow-down',
        'back': 'undo',
        'arrived': 'check-circle',
        'straight': 'arrow-up',
    };
    return iconMap[direction] || 'arrow-up';
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(28, 52, 95, 0.95)',
        borderRadius: 16,
        margin: 12,
        maxHeight: 350,
        overflow: 'hidden',
    },
    collapsedContainer: {
        backgroundColor: 'rgba(28, 52, 95, 0.9)',
        borderRadius: 12,
        margin: 12,
        padding: 12,
    },
    collapsedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    collapsedText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    collapseButton: {
        padding: 4,
    },
    messagesContainer: {
        maxHeight: 200,
    },
    messagesContent: {
        padding: 12,
        gap: 8,
    },
    emptyState: {
        alignItems: 'center',
        padding: 16,
    },
    emptyStateText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    suggestionChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    suggestionText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    messageBubble: {
        borderRadius: 16,
        padding: 12,
        maxWidth: '85%',
    },
    userBubble: {
        backgroundColor: MBTA_COLORS.green,
        alignSelf: 'flex-end',
    },
    assistantBubble: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#FFF',
    },
    directionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        backgroundColor: 'rgba(0, 132, 61, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    directionText: {
        color: MBTA_COLORS.green,
        fontSize: 11,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#FFF',
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: MBTA_COLORS.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

export default ChatInterface;
