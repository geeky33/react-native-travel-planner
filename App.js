import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import Icon from './src/components/Icon';
import StatusToast from './src/components/StatusToast';
import { DomHelper } from './src/dom/uiHelper';
import HomeScreen from './src/screens/HomeScreen';
import PlacesScreen from './src/screens/PlacesScreen';
import TrackerScreen from './src/screens/TrackerScreen';
import { colors } from './src/theme';

// Experiment 5: DOM manipulation (page title) - now UiHelper in React Native
DomHelper.setPageTitle('TravelMate - Dart DOM Application');

// =============================================================
// DESTINATIONS (shared by the bottom bar and the side rail)
// =============================================================

const DESTINATIONS = [
  { label: 'Home', icon: 'home-outline', selectedIcon: 'home' },
  { label: 'Places', icon: 'compass-outline', selectedIcon: 'compass' },
  {
    label: 'Tracker',
    icon: 'map-marker-outline',
    selectedIcon: 'map-marker',
  },
];

// =============================================================
// APP
// =============================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <MainScreen />
    </SafeAreaProvider>
  );
}

// =============================================================
// MAIN SCREEN
// =============================================================

function MainScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // MEDIAQUERY equivalent
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isDesktop = width >= 1000;

  const handleNavigation = (index) => {
    setSelectedIndex(index);

    // Experiment 5: DOM event handling
    DomHelper.updateStatus(`DOM Event: ${DESTINATIONS[index].label} selected`);
  };

  // Screens stay mounted (like Flutter's IndexedStack) so that
  // search text, filters and the map keep their state.
  const screens = [HomeScreen, PlacesScreen, TrackerScreen];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.body}>
        {/* =================================================== */}
        {/* TABLET / DESKTOP NAVIGATION                         */}
        {/* =================================================== */}
        {!isMobile && (
          <NavRail
            selectedIndex={selectedIndex}
            onSelect={handleNavigation}
            extended={isDesktop}
          />
        )}

        {/* =================================================== */}
        {/* SCREEN CONTENT                                      */}
        {/* =================================================== */}
        <View style={{ flex: 1 }}>
          {screens.map((Screen, i) => (
            <View
              key={i}
              style={[
                StyleSheet.absoluteFill,
                { display: i === selectedIndex ? 'flex' : 'none' },
              ]}
            >
              <Screen />
            </View>
          ))}

          <StatusToast />
        </View>
      </View>

      {/* ===================================================== */}
      {/* MOBILE NAVIGATION                                     */}
      {/* ===================================================== */}
      {isMobile && (
        <NavBar selectedIndex={selectedIndex} onSelect={handleNavigation} />
      )}
    </SafeAreaView>
  );
}

// =============================================================
// BOTTOM NAVIGATION BAR (mobile)
// =============================================================

function NavBar({ selectedIndex, onSelect }) {
  return (
    <View style={styles.navBar}>
      {DESTINATIONS.map((d, i) => {
        const selected = i === selectedIndex;

        return (
          <Pressable
            key={d.label}
            style={styles.navItem}
            onPress={() => onSelect(i)}
          >
            <View
              style={[
                styles.navIndicator,
                selected && { backgroundColor: colors.blue100 },
              ]}
            >
              <Icon
                name={selected ? d.selectedIcon : d.icon}
                size={24}
                color={selected ? colors.primary : colors.slate500}
              />
            </View>

            <Text
              style={{
                fontSize: 12,
                color: selected ? colors.primary : colors.slate500,
                fontWeight: selected ? '700' : '500',
              }}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================
// NAVIGATION RAIL (tablet / desktop)
// =============================================================

function NavRail({ selectedIndex, onSelect, extended }) {
  return (
    <View style={[styles.rail, { width: extended ? 200 : 80 }]}>
      <View style={styles.railLogo}>
        <View style={styles.railLogoBox}>
          <Icon name="airplane-takeoff" size={24} color={colors.primary} />
        </View>

        {extended && <Text style={styles.railLogoText}>TravelMate</Text>}
      </View>

      {DESTINATIONS.map((d, i) => {
        const selected = i === selectedIndex;

        return (
          <Pressable
            key={d.label}
            onPress={() => onSelect(i)}
            style={[
              styles.railItem,
              extended
                ? { flexDirection: 'row', marginHorizontal: 12 }
                : { alignItems: 'center' },
            ]}
          >
            <View
              style={[
                styles.railIndicator,
                selected && { backgroundColor: colors.blue100 },
              ]}
            >
              <Icon
                name={selected ? d.selectedIcon : d.icon}
                size={24}
                color={selected ? colors.primary : colors.slate500}
              />

              {extended && (
                <Text
                  style={{
                    marginLeft: 12,
                    color: selected ? colors.primary : colors.slate500,
                    fontWeight: selected ? '700' : '500',
                  }}
                >
                  {d.label}
                </Text>
              )}
            </View>

            {!extended && (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: selected ? colors.primary : colors.slate500,
                  fontWeight: selected ? '700' : '500',
                }}
              >
                {d.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, flexDirection: 'row' },

  // bottom bar
  navBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: colors.white,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 4,
    borderRadius: 16,
  },

  // rail
  rail: { backgroundColor: colors.white, paddingBottom: 12 },
  railLogo: { alignItems: 'center', paddingTop: 20, paddingBottom: 25 },
  railLogoBox: {
    padding: 10,
    backgroundColor: colors.blue100,
    borderRadius: 14,
  },
  railLogoText: {
    marginTop: 8,
    fontWeight: '800',
    fontSize: 13,
    color: colors.ink,
  },
  railItem: { marginVertical: 6 },
  railIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
