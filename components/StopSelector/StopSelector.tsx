import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal } from 'react-native';
import { Stop, Route } from '../../src/types/mbta';
import { MBTA_COLORS } from '../../constants/Colors';
import { getRouteColor } from '../../src/utils/helpers';
import { Ionicons } from '@expo/vector-icons';

interface StopSelectorProps {
    stops: Stop[];
    routes?: Route[];
    selectedStop?: Stop | null;
    onSelectStop: (stop: Stop) => void;
    label?: string;
    placeholder?: string;
}

export function StopSelector({
    stops,
    routes = [],
    selectedStop,
    onSelectStop,
    label = 'Select Stop',
    placeholder = 'Search for a station...',
}: StopSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStops = stops.filter((stop) =>
        stop.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStopRoutes = (stop: Stop): Route[] => {
        // In a real implementation, you'd filter routes that serve this stop
        return routes.slice(0, 3);
    };

    const renderStop = ({ item }: { item: Stop }) => {
        const stopRoutes = getStopRoutes(item);

        return (
            <TouchableOpacity
                style={styles.stopItem}
                onPress={() => {
                    onSelectStop(item);
                    setModalVisible(false);
                    setSearchQuery('');
                }}
            >
                <View style={styles.stopIcon}>
                    <Ionicons name="train" size={20} color={MBTA_COLORS.navy} />
                </View>
                <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>{item.attributes.name}</Text>
                    {item.attributes.municipality && (
                        <Text style={styles.stopLocation}>{item.attributes.municipality}</Text>
                    )}
                    {stopRoutes.length > 0 && (
                        <View style={styles.routeBadges}>
                            {stopRoutes.map((route) => (
                                <View
                                    key={route.id}
                                    style={[
                                        styles.miniRouteBadge,
                                        { backgroundColor: getRouteColor(route.id, route.attributes.color) },
                                    ]}
                                >
                                    <Text style={styles.miniRouteBadgeText}>
                                        {route.attributes.short_name || route.id}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={MBTA_COLORS.textLight} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                {selectedStop ? (
                    <View style={styles.selectedContent}>
                        <Ionicons name="location" size={20} color={MBTA_COLORS.navy} />
                        <Text style={styles.selectedText}>{selectedStop.attributes.name}</Text>
                    </View>
                ) : (
                    <View style={styles.selectedContent}>
                        <Ionicons name="search" size={20} color={MBTA_COLORS.textLight} />
                        <Text style={styles.placeholderText}>{placeholder}</Text>
                    </View>
                )}
                <Ionicons name="chevron-down" size={20} color={MBTA_COLORS.textLight} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setModalVisible(false);
                                setSearchQuery('');
                            }}
                        >
                            <Ionicons name="close" size={24} color={MBTA_COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={MBTA_COLORS.textLight} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            placeholderTextColor={MBTA_COLORS.textLight}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={MBTA_COLORS.textLight} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filteredStops}
                        renderItem={renderStop}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="train-outline" size={48} color={MBTA_COLORS.textLight} />
                                <Text style={styles.emptyText}>No stations found</Text>
                            </View>
                        }
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: MBTA_COLORS.text,
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    selectedText: {
        fontSize: 16,
        fontWeight: '500',
        color: MBTA_COLORS.text,
    },
    placeholderText: {
        fontSize: 16,
        color: MBTA_COLORS.textLight,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: MBTA_COLORS.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: MBTA_COLORS.navy,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: MBTA_COLORS.text,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    stopItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        gap: 12,
    },
    stopIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopInfo: {
        flex: 1,
    },
    stopName: {
        fontSize: 16,
        fontWeight: '600',
        color: MBTA_COLORS.text,
    },
    stopLocation: {
        fontSize: 13,
        color: MBTA_COLORS.textLight,
        marginTop: 2,
    },
    routeBadges: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
    },
    miniRouteBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    miniRouteBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: MBTA_COLORS.textLight,
        marginTop: 12,
    },
});

export default StopSelector;
