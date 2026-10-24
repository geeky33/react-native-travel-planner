import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import { useTripData } from '../data/tripData';
import { DomHelper } from '../dom/uiHelper';
import { cardShadow, colors } from '../theme';

// ==========================================================
// PLACES SCREEN
// ==========================================================

export default function PlacesScreen() {
  const { width } = useWindowDimensions();
  const tripData = useTripData();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPlace, setNewPlace] = useState('');
  const [snack, setSnack] = useState(null); // { message, onUndo }
  const snackTimer = useRef(null);

  const isWide = width >= 700;
  const progress = tripData.progress;

  useEffect(() => () => clearTimeout(snackTimer.current), []);

  // ==========================================================
  // SNACKBAR
  // ==========================================================

  const showSnack = (message, onUndo) => {
    clearTimeout(snackTimer.current);
    setSnack({ message, onUndo });
    snackTimer.current = setTimeout(() => setSnack(null), 4000);
  };

  // ==========================================================
  // ADD PLACE
  // ==========================================================

  const openAddDialog = () => {
    setNewPlace('');
    setDialogVisible(true);
  };

  const addPlace = () => {
    const name = newPlace.trim();

    if (name.length > 0) {
      tripData.addPlace(name);

      // Experiment 5: dynamic DOM update.
      DomHelper.updateStatus(`${name} dynamically added using Dart DOM`);

      setDialogVisible(false);
      showSnack(`${name} added to your trip!`);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const deletePlace = (index) => {
    const removedPlace = tripData.places[index];

    tripData.removePlace(index);

    // Experiment 5: dynamic DOM update.
    DomHelper.updateStatus(`${removedPlace.name} dynamically removed`);

    showSnack(`${removedPlace.name} deleted`, () => {
      tripData.restorePlace(index, removedPlace);

      DomHelper.updateStatus(`${removedPlace.name} restored dynamically`);
      setSnack(null);
    });
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredPlaces = useMemo(() => {
    const searchText = search.toLowerCase();

    return tripData.places.filter((place) => {
      const matchesSearch = place.name.toLowerCase().includes(searchText);

      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Visited' && place.visited) ||
        (selectedFilter === 'Pending' && !place.visited);

      return matchesSearch && matchesFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripData.places, search, selectedFilter]);

  const sidePadding = isWide ? 30 : 20;

  // ==========================================================
  // BUILD
  // ==========================================================

  return (
    <View style={styles.screen}>
      <AppBar
        actions={
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {tripData.totalPlaces} Places
            </Text>
          </View>
        }
      >
        <Text style={styles.title}>Places to Visit</Text>
      </AppBar>

      <View style={{ paddingHorizontal: sidePadding, paddingTop: 5 }}>
        <ProgressCard progress={progress} tripData={tripData} />
      </View>

      <View style={{ paddingHorizontal: sidePadding, marginTop: 12 }}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={22} color={colors.slate500} />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search places..."
            placeholderTextColor={colors.slate400}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Icon name="close" size={22} color={colors.slate500} />
            </Pressable>
          )}
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: sidePadding,
          marginTop: 12,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {['All', 'Visited', 'Pending'].map((title) => (
          <FilterChip
            key={title}
            title={title}
            selected={selectedFilter === title}
            onPress={() => {
              setSelectedFilter(title);

              DomHelper.updateStatus(`DOM Event: ${title} filter selected`);
            }}
          />
        ))}
      </View>

      <View style={{ height: 12 }} />

      {filteredPlaces.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          key={isWide ? 'grid' : 'list'}
          data={filteredPlaces}
          numColumns={isWide ? 2 : 1}
          keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={isWide ? { gap: 14 } : undefined}
          contentContainerStyle={{
            paddingTop: 8,
            paddingHorizontal: sidePadding,
            paddingBottom: 100,
          }}
          renderItem={({ item }) => {
            const index = tripData.places.indexOf(item);

            return (
              <View style={isWide ? { flex: 1 } : undefined}>
                <PlaceCard
                  place={item}
                  onDelete={() => deletePlace(index)}
                  onToggle={(isVisited) => {
                    tripData.toggleVisited(index, isVisited);

                    // Experiment 5: DOM event + dynamic text update.
                    DomHelper.updateStatus(
                      isVisited
                        ? `${item.name} marked as visited`
                        : `${item.name} marked as pending`,
                    );
                  }}
                />
              </View>
            );
          }}
        />
      )}

      {/* Floating action button */}
      <Pressable style={styles.fab} onPress={openAddDialog}>
        <Icon name="plus" size={24} color={colors.white} />
        <Text style={styles.fabText}>Add Place</Text>
      </Pressable>

      {/* Snackbar */}
      {snack && (
        <View style={styles.snack}>
          <Text style={styles.snackText}>{snack.message}</Text>

          {snack.onUndo && (
            <Pressable onPress={snack.onUndo}>
              <Text style={styles.snackAction}>UNDO</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Add place dialog */}
      <Modal
        visible={dialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDialogVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Add a new place</Text>

            <View style={styles.dialogInputBox}>
              <Icon
                name="map-marker-outline"
                size={22}
                color={colors.slate500}
              />

              <TextInput
                style={styles.searchInput}
                value={newPlace}
                onChangeText={setNewPlace}
                placeholder="e.g. Candolim Beach"
                placeholderTextColor={colors.slate400}
                autoFocus
                onSubmitEditing={addPlace}
              />
            </View>

            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancel}
                onPress={() => setDialogVisible(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.dialogAdd} onPress={addPlace}>
                <Text style={styles.dialogAddText}>Add Place</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ==========================================================
// PROGRESS
// ==========================================================

function ProgressCard({ progress, tripData }) {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.progressCard}
    >
      <View style={styles.spaceBetween}>
        <Text style={styles.progressTitle}>Trip Progress</Text>

        <Text style={styles.progressPercent}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={styles.progressSub}>
        {tripData.visitedCount} of {tripData.totalPlaces} places visited
      </Text>
    </LinearGradient>
  );
}

// ==========================================================
// FILTER CHIP
// ==========================================================

function FilterChip({ title, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.primary : colors.white },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.white : colors.slate600 },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// ==========================================================
// SWIPE TO DELETE  (replacement for Flutter's Dismissible)
// ==========================================================

function SwipeToDelete({ children, onDelete }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const widthRef = useRef(300);
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,

      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx < -widthRef.current * 0.35) {
          Animated.timing(translateX, {
            toValue: -widthRef.current,
            duration: 160,
            useNativeDriver: true,
          }).start(() => onDeleteRef.current());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <View
      style={styles.swipeWrapper}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
    >
      <View style={styles.swipeBackground}>
        <Icon name="delete-outline" size={28} color={colors.white} />
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

// ==========================================================
// PLACE CARD
// ==========================================================

function PlaceCard({ place, onDelete, onToggle }) {
  const visited = place.visited;

  return (
    <SwipeToDelete onDelete={onDelete}>
      <Pressable
        onPress={() => onToggle(!visited)}
        style={[styles.placeCard, cardShadow]}
      >
        <View
          style={[
            styles.placeIconBox,
            { backgroundColor: place.color + '1A' },
          ]}
        >
          <Icon name={place.icon} size={24} color={place.color} />
        </View>

        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <Text
            style={[
              styles.placeName,
              {
                color: visited ? colors.slate400 : colors.ink,
                textDecorationLine: visited ? 'line-through' : 'none',
              },
            ]}
          >
            {place.name}
          </Text>

          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: visited ? colors.green : colors.slate500,
            }}
          >
            {visited ? '✓ Completed' : 'Ready to explore'}
          </Text>
        </View>

        <View
          style={[
            styles.checkbox,
            visited && {
              backgroundColor: colors.green,
              borderColor: colors.green,
            },
          ]}
        >
          {visited && <Icon name="check" size={16} color={colors.white} />}
        </View>
      </Pressable>
    </SwipeToDelete>
  );
}

// ==========================================================
// EMPTY
// ==========================================================

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name="map-search-outline" size={45} color={colors.primary} />
      </View>

      <Text style={styles.emptyTitle}>No places found</Text>

      <Text style={styles.emptySub}>
        Try another search or add a new destination.
      </Text>
    </View>
  );
}

// ==========================================================
// STYLES
// ==========================================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { fontWeight: '800', fontSize: 22, color: colors.ink },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.blue100,
    borderRadius: 20,
  },
  countPillText: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  // progress
  progressCard: { padding: 18, borderRadius: 22 },
  progressTitle: { color: colors.white, fontWeight: '700' },
  progressPercent: { color: colors.white, fontSize: 18, fontWeight: '800' },
  progressTrack: {
    marginTop: 12,
    height: 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: { height: '100%', backgroundColor: colors.white },
  progressSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.ink,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  // chips
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20 },
  chipText: { fontWeight: '600' },

  // swipe
  swipeWrapper: { marginBottom: 12 },
  swipeBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.red,
    borderRadius: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 25,
  },

  // place card
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  placeIconBox: { padding: 11, borderRadius: 14 },
  placeName: { fontWeight: '700', fontSize: 16 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: {
    padding: 22,
    backgroundColor: colors.blue50,
    borderRadius: 60,
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: '800',
    color: colors.ink,
  },
  emptySub: {
    marginTop: 6,
    textAlign: 'center',
    color: colors.slate500,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: colors.white, fontWeight: '700' },

  // snackbar
  snack: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    elevation: 8,
  },
  snackText: { flex: 1, color: colors.white },
  snackAction: { marginLeft: 16, color: '#93C5FD', fontWeight: '700' },

  // dialog
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 24,
  },
  dialogTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  dialogInputBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: colors.slate100,
    borderRadius: 15,
  },
  dialogActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dialogCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  dialogCancelText: { color: colors.primary, fontWeight: '600' },
  dialogAdd: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dialogAddText: { color: colors.white, fontWeight: '600' },
});
