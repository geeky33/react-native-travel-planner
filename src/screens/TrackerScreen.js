import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import { useTripData } from '../data/tripData';
import { DomHelper } from '../dom/uiHelper';
import { cardShadow, colors } from '../theme';

// react-native-maps only exists on Android / iOS.
let MapView = null;
let Marker = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

const GOA = { latitude: 15.4909, longitude: 73.8278 };

// ==========================================================
// TRACKER SCREEN
// ==========================================================

export default function TrackerScreen() {
  const { width, height } = useWindowDimensions();
  const tripData = useTripData();

  const mapRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState(
    'Getting your location...',
  );

  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // CURRENT LOCATION
  // ==========================================================

  const fail = (message, status) => {
    setIsLoading(false);
    setLocationMessage(message);
    DomHelper.updateStatus(status ?? message.replace(/\.$/, ''));
  };

  const getCurrentLocation = async () => {
    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();

      if (!serviceEnabled) {
        return fail(
          'Location services are disabled.',
          'Location services are disabled',
        );
      }

      let permission = await Location.getForegroundPermissionsAsync();

      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        return permission.canAskAgain
          ? fail('Location permission denied.', 'Location permission denied')
          : fail(
              'Location permission permanently denied.',
              'Location permission permanently denied',
            );
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(location);
      setIsLoading(false);
      setLocationMessage('Location found');

      DomHelper.updateStatus('Current location obtained successfully');

      animateTo(location, 0.25);
    } catch (e) {
      fail('Unable to get your location.', 'Unable to get current location');
    }
  };

  const animateTo = (location, delta) => {
    mapRef.current?.animateToRegion(
      { ...location, latitudeDelta: delta, longitudeDelta: delta },
      600,
    );
  };

  // ==========================================================
  // RECENTER
  // ==========================================================

  const recenter = () => {
    if (!currentLocation || !mapRef.current) {
      DomHelper.updateStatus('Current location is not available yet');
      return;
    }

    animateTo(currentLocation, 0.12);

    DomHelper.updateStatus('Map recentered using current location');
  };

  // ==========================================================
  // MARKERS
  // ==========================================================

  const renderMarkers = () => {
    const markers = [];

    // ---------------- CURRENT LOCATION ----------------
    if (currentLocation) {
      markers.push(
        <Marker
          key="current_location"
          coordinate={currentLocation}
          pinColor="azure"
          title="Your Current Location"
          onPress={() =>
            DomHelper.updateStatus(
              'DOM Event: Current location marker selected',
            )
          }
        />,
      );
    }

    // ---------------- DESTINATION MARKERS ----------------
    for (const place of tripData.places) {
      // Places added manually don't have coordinates yet.
      if (place.latitude === 0 || place.longitude === 0) continue;

      markers.push(
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.latitude,
            longitude: place.longitude,
          }}
          pinColor={place.visited ? 'green' : 'red'}
          title={place.name}
          description={place.visited ? '✓ Completed' : 'Ready to explore'}
          onPress={() =>
            DomHelper.updateStatus(
              `${place.name}: ${
                place.visited ? 'Completed' : 'Ready to explore'
              }`,
            )
          }
        />,
      );
    }

    return markers;
  };

  // ==========================================================
  // MAP
  // ==========================================================

  const renderMap = () => (
    <View style={styles.mapWrapper}>
      {MapView ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            ...GOA,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          onMapReady={() =>
            DomHelper.updateStatus('Google Map initialized successfully')
          }
          showsUserLocation={false}
          showsMyLocationButton={false}
          zoomControlEnabled={false}
          showsCompass
          toolbarEnabled
        >
          {renderMarkers()}
        </MapView>
      ) : (
        <View style={styles.webFallback}>
          <Icon name="map-outline" size={40} color={colors.slate400} />
          <Text style={styles.webFallbackText}>
            The map is available on Android and iOS.
          </Text>
        </View>
      )}

      {/* LIVE LOCATION LABEL */}
      <View style={styles.liveLabel}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>Live Location</Text>
      </View>

      {/* RECENTER */}
      <Pressable style={styles.recenter} onPress={recenter}>
        <Icon name="crosshairs-gps" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );

  // ==========================================================
  // LOCATION CARD
  // ==========================================================

  const renderLocationCard = () => (
    <View style={[styles.card, cardShadow]}>
      <Text style={styles.cardTitle}>Current Location</Text>

      <Text style={styles.cardSub}>
        {isLoading ? 'Getting your location...' : locationMessage}
      </Text>

      {currentLocation && (
        <View style={styles.gpsBox}>
          <View style={styles.gpsIcon}>
            <Icon name="crosshairs-gps" size={24} color={colors.primary} />
          </View>

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.gpsLabel}>GPS Coordinates</Text>

            <Text style={styles.gpsValue}>
              {currentLocation.latitude.toFixed(5)}°,{' '}
              {currentLocation.longitude.toFixed(5)}°
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.controlsTitle}>Map Controls</Text>

      <Text style={styles.controlsText}>
        Pan and zoom the map to explore destinations. Tap a marker to view
        trip details.
      </Text>
    </View>
  );

  // ==========================================================
  // TRIP PROGRESS
  // ==========================================================

  const renderProgressCard = () => {
    const progress = tripData.progress;
    const next = tripData.nextDestination;

    return (
      <View style={[styles.card, cardShadow]}>
        <Text style={styles.cardTitle}>Trip Progress</Text>

        <Text style={styles.cardSubPlain}>Your journey at a glance</Text>

        <View style={[styles.spaceBetween, { marginTop: 18 }]}>
          <Text style={{ fontWeight: '600', color: colors.ink }}>
            {tripData.visitedCount} of {tripData.totalPlaces} places visited
          </Text>

          <Text style={{ color: colors.primary, fontWeight: '800' }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={{ height: 18 }} />

        {next ? (
          <View style={styles.nextBox}>
            <View
              style={[
                styles.nextIcon,
                { backgroundColor: next.color + '1A' },
              ]}
            >
              <Icon name={next.icon} size={24} color={next.color} />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.nextLabel}>Next Destination</Text>
              <Text style={styles.nextName}>{next.name}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: colors.green, fontWeight: '700' }}>
            🎉 All destinations completed!
          </Text>
        )}
      </View>
    );
  };

  // ==========================================================
  // RESPONSIVE CONTENT
  // ==========================================================

  const isWide = width >= 900;
  const isLandscape = width > height;

  const renderContent = () => {
    if (isWide || isLandscape) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 3 }}>{renderMap()}</View>

          <View style={{ flex: 2, marginLeft: 18 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderLocationCard()}
              <View style={{ height: 18 }} />
              {renderProgressCard()}
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: Math.max(300, height * 0.4) }}>
          {renderMap()}
        </View>

        <View style={{ height: 16 }} />
        {renderLocationCard()}

        <View style={{ height: 16 }} />
        {renderProgressCard()}
      </ScrollView>
    );
  };

  // ==========================================================
  // BUILD
  // ==========================================================

  return (
    <View style={styles.screen}>
      <AppBar
        actions={
          <View style={styles.activePill}>
            <Icon name="circle" size={8} color={colors.green} />
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
        }
      >
        <Text style={styles.title}>Trip Tracker</Text>
      </AppBar>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {renderContent()}
      </View>
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
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.green50b,
    borderRadius: 20,
  },
  activeText: { color: colors.greenDark, fontWeight: '700', fontSize: 12 },

  // map
  mapWrapper: {
    flex: 1,
    minHeight: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.slate200,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webFallbackText: { color: colors.slate500 },
  liveLabel: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  liveText: { marginLeft: 7, fontWeight: '700', color: colors.ink },
  recenter: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  // cards
  card: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  cardSub: { marginTop: 5, marginBottom: 18, color: colors.slate500 },
  cardSubPlain: { marginTop: 5, color: colors.slate500 },

  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 18,
    backgroundColor: colors.blue50,
    borderRadius: 16,
  },
  gpsIcon: { padding: 10, backgroundColor: colors.blue100, borderRadius: 30 },
  gpsLabel: { color: colors.slate500, fontSize: 12 },
  gpsValue: { marginTop: 4, fontWeight: '700', color: colors.ink },

  controlsTitle: { fontWeight: '700', fontSize: 16, color: colors.ink },
  controlsText: { marginTop: 6, color: colors.slate500, fontSize: 12 },

  // progress
  track: {
    marginTop: 10,
    height: 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.slate200,
  },
  fill: { height: '100%', backgroundColor: colors.primary },
  nextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  nextIcon: { padding: 10, borderRadius: 12 },
  nextLabel: { color: colors.slate500, fontSize: 12 },
  nextName: { marginTop: 3, fontWeight: '700', color: colors.ink },
});
