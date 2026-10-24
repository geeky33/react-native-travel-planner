import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import { useTripData } from '../data/tripData';
import { DomHelper, useUiElement } from '../dom/uiHelper';
import { cardShadow, colors } from '../theme';

// ==========================================================
// HOME SCREEN
// ==========================================================

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const trip = useTripData();

  const stats = [
    {
      icon: 'map-marker',
      value: String(trip.totalPlaces),
      title: 'Places',
      color: colors.primary,
      background: colors.blue50,
    },
    {
      icon: 'calendar-month',
      value: '4',
      title: 'Days',
      color: colors.purple,
      background: colors.violet50,
    },
    {
      icon: 'check-circle',
      value: String(trip.visitedCount),
      title: 'Visited',
      color: colors.green,
      background: colors.green50,
    },
  ];

  let body;
  if (width < 600) {
    body = <MobileLayout stats={stats} />;
  } else if (width < 1024) {
    body = <TabletLayout stats={stats} />;
  } else {
    body = <DesktopLayout stats={stats} />;
  }

  return (
    <View style={styles.screen}>
      <AppBar
        actions={
          <Pressable
            style={styles.bellButton}
            onPress={() =>
              DomHelper.updateStatus(
                'Notification button clicked - DOM event detected',
              )
            }
          >
            <Icon
              name="bell-outline"
              size={24}
              color={colors.ink}
            />
          </Pressable>
        }
      >
        <View style={styles.logoBox}>
          <Icon
            name="airplane-takeoff"
            size={22}
            color={colors.primary}
          />
        </View>

        <Text style={styles.appTitle}>TravelMate</Text>
      </AppBar>

      {body}
    </View>
  );
}

// ==========================================================
// MOBILE
// ==========================================================

function MobileLayout({ stats }) {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 30,
      }}
    >
      <Welcome />

      <Gap h={24} />
      <TripCard />

      <Gap h={24} />
      <DomDemoCard />

      <Gap h={28} />
      <SectionTitle
        title="Trip Overview"
        subtitle="Your journey at a glance"
      />

      <Gap h={14} />
      <View>
        {stats.map((s, i) => (
          <View key={s.title} style={{ marginTop: i === 0 ? 0 : 12 }}>
            <StatCard {...s} />
          </View>
        ))}
      </View>

      <Gap h={28} />
      <Upcoming />

      <Gap h={25} />
      <TravelTip />
    </ScrollView>
  );
}

// ==========================================================
// TABLET
// ==========================================================

function TabletLayout({ stats }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 28 }}>
      <Welcome />

      <Gap h={25} />
      <TripCard />

      <Gap h={24} />
      <DomDemoCard />

      <Gap h={28} />
      <SectionTitle
        title="Trip Overview"
        subtitle="Your journey at a glance"
      />

      <Gap h={14} />
      <View style={{ flexDirection: 'row' }}>
        {stats.map((s, i) => (
          <View
            key={s.title}
            style={{ flex: 1, marginLeft: i === 0 ? 0 : 15 }}
          >
            <StatCard {...s} />
          </View>
        ))}
      </View>

      <Gap h={30} />
      <Upcoming />

      <Gap h={25} />
      <TravelTip />
    </ScrollView>
  );
}

// ==========================================================
// DESKTOP
// ==========================================================

function DesktopLayout({ stats }) {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 45,
        paddingVertical: 25,
        alignItems: 'center',
      }}
    >
      <View style={{ width: '100%', maxWidth: 1250 }}>
        <Welcome />

        <Gap h={25} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 2 }}>
            <TripCard />
          </View>

          <View style={{ flex: 1, marginLeft: 20 }}>
            {stats.map((s, i) => (
              <View key={s.title} style={{ marginTop: i === 0 ? 0 : 12 }}>
                <StatCard {...s} />
              </View>
            ))}
          </View>
        </View>

        <Gap h={24} />
        <DomDemoCard />

        <Gap h={35} />
        <SectionTitle title="Upcoming" subtitle="Your next destinations" />

        <Gap h={15} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
          {UPCOMING.map((p) => (
            <View key={p.name} style={{ width: 380 }}>
              <PlaceCard {...p} />
            </View>
          ))}
        </View>

        <Gap h={25} />
        <TravelTip />
      </View>
    </ScrollView>
  );
}

// ==========================================================
// DOM DEMO CARD  (Dart DOM Lab)
// ==========================================================

function DomDemoCard() {
  // Text of this element can be changed with DomHelper.updateElementText
  const subtitle = useUiElement('dom-lab-subtitle');

  return (
    <View style={[styles.domCard, cardShadow]}>
      <View style={styles.row}>
        <View style={styles.domIconBox}>
          <Icon name="code-tags" size={24} color={colors.primary} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.domTitle}>Dart DOM Lab</Text>

          <Text style={[styles.domSubtitle, { marginTop: 3 }]}>
            {subtitle.text ?? 'Interact with the browser DOM'}
          </Text>
        </View>
      </View>

      <Gap h={18} />
      <Text style={styles.domExperiment}>
        Experiment 5: HTML DOM Application
      </Text>

      <Gap h={14} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Pressable
          style={styles.elevatedButton}
          onPress={() =>
            DomHelper.updateStatus('DOM updated successfully from HomeScreen!')
          }
        >
          <Icon name="pencil" size={18} color={colors.white} />
          <Text style={styles.elevatedButtonText}>Update DOM</Text>
        </Pressable>

        <Pressable
          style={styles.outlinedButton}
          onPress={() => {
            DomHelper.setPageTitle('TravelMate • DOM Updated');

            DomHelper.updateStatus('Browser page title updated using Dart DOM!');
          }}
        >
          <Icon name="format-title" size={18} color={colors.primary} />
          <Text style={styles.outlinedButtonText}>Change Title</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================================
// WELCOME
// ==========================================================

function Welcome() {
  return (
    <View>
      <Text style={styles.welcomeSmall}>Hello, Traveler! 👋</Text>

      <Text style={styles.welcomeBig}>Plan your next adventure</Text>

      <Text style={styles.welcomeSub}>
        Everything you need for your journey, in one place.
      </Text>
    </View>
  );
}

// ==========================================================
// TRIP CARD
// ==========================================================

function TripCard() {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, colors.sky]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.tripCard}
    >
      <View style={styles.tripCircle} />

      <View style={styles.tripContent}>
        <View style={styles.tripTop}>
          <View style={styles.tripIconBox}>
            <Icon name="airplane-takeoff" size={24} color={colors.white} />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>UPCOMING</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={styles.tripLabel}>MY NEXT TRIP</Text>
        <Text style={styles.tripTitle}>Goa, India 🌴</Text>
        <Text style={styles.tripDate}>15 Aug - 19 Aug 2026</Text>
      </View>
    </LinearGradient>
  );
}

// ==========================================================
// STAT CARD
// ==========================================================

function StatCard({ icon, value, title, color, background }) {
  return (
    <View style={[styles.statCard, cardShadow]}>
      <View style={[styles.statIconBox, { backgroundColor: background }]}>
        <Icon name={icon} size={24} color={color} />
      </View>

      <View style={{ marginLeft: 12, flexShrink: 1 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

// ==========================================================
// UPCOMING
// ==========================================================

const UPCOMING = [
  {
    name: 'Baga Beach',
    time: 'Day 1 • 10:00 AM',
    icon: 'beach',
    color: colors.sky,
  },
  {
    name: 'Fort Aguada',
    time: 'Day 2 • 11:00 AM',
    icon: 'castle',
    color: colors.purple,
  },
  {
    name: 'Dudhsagar Falls',
    time: 'Day 3 • 9:00 AM',
    icon: 'waterfall',
    color: colors.green,
  },
];

function Upcoming() {
  return (
    <View>
      <SectionTitle title="Upcoming" subtitle="Your next destinations" />

      <Gap h={14} />

      {UPCOMING.map((p, i) => (
        <View key={p.name} style={{ marginTop: i === 0 ? 0 : 10 }}>
          <PlaceCard {...p} />
        </View>
      ))}
    </View>
  );
}

function PlaceCard({ name, time, icon, color }) {
  return (
    <View style={[styles.placeCard, cardShadow]}>
      <View style={[styles.placeIconBox, { backgroundColor: color + '1A' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>

      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.placeName}>{name}</Text>
        <Text style={styles.placeTime}>{time}</Text>
      </View>

      <Icon name="chevron-right" size={20} color={colors.slate500} />
    </View>
  );
}

// ==========================================================
// SECTION TITLE
// ==========================================================

function SectionTitle({ title, subtitle }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ==========================================================
// TRAVEL TIP
// ==========================================================

function TravelTip() {
  return (
    <View style={styles.tip}>
      <Icon name="lightbulb-on" size={24} color={colors.orange} />

      <Text style={styles.tipText}>
        Keep some extra time between destinations for unexpected delays.
      </Text>
    </View>
  );
}

function Gap({ h }) {
  return <View style={{ height: h }} />;
}

// ==========================================================
// STYLES
// ==========================================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },

  // app bar
  logoBox: {
    padding: 8,
    backgroundColor: colors.blue100,
    borderRadius: 12,
  },
  appTitle: {
    marginLeft: 12,
    fontWeight: '800',
    fontSize: 21,
    color: colors.ink,
  },
  bellButton: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
  },

  // dom demo
  domCard: {
    width: '100%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  domIconBox: {
    padding: 10,
    backgroundColor: colors.blue100,
    borderRadius: 12,
  },
  domTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  domSubtitle: { fontSize: 12, color: colors.slate500 },
  domExperiment: { fontWeight: '600', color: colors.slate700 },
  elevatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  elevatedButtonText: { color: colors.white, fontWeight: '600' },
  outlinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.slate400,
    borderRadius: 20,
  },
  outlinedButtonText: { color: colors.primary, fontWeight: '600' },

  // welcome
  welcomeSmall: { fontSize: 15, color: colors.slate500, fontWeight: '500' },
  welcomeBig: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.ink,
  },
  welcomeSub: { marginTop: 8, fontSize: 14, color: colors.slate500 },

  // trip card
  tripCard: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tripCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tripContent: { flex: 1, padding: 22 },
  tripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripIconBox: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  tripLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  tripTitle: {
    marginTop: 5,
    color: colors.white,
    fontSize: 27,
    fontWeight: '800',
  },
  tripDate: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },

  // stat card
  statCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  statIconBox: { padding: 9, borderRadius: 12 },
  statValue: { fontSize: 21, fontWeight: '800', color: colors.ink },
  statTitle: { fontSize: 11, color: colors.slate500 },

  // place card
  placeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
  },
  placeIconBox: { padding: 11, borderRadius: 14 },
  placeName: { fontWeight: '700', color: colors.ink, fontSize: 16 },
  placeTime: { marginTop: 2, fontSize: 12, color: colors.slate500 },

  // section title
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sectionSubtitle: { marginTop: 3, fontSize: 12, color: colors.slate400 },

  // tip
  tip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.orange50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.orange200,
  },
  tipText: {
    flex: 1,
    marginLeft: 14,
    color: colors.orange900,
    fontSize: 13,
  },
});
