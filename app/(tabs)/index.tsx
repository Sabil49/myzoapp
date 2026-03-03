// app/(tabs)/index.tsx
//
// Home screen with:
//   • Editorial header, hero carousel, editorial banner, promise strip (dummy)
//   • Real categories from API as image-circle chips (from collections.tsx)
//   • Real products from API filtered by selected category (from collections.tsx)
//   • No dummy product fallback — shows empty state if API returns nothing
//

import { SPACING } from "@/constants/theme";
import type { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/store/services/productsApi";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2;

// ─── Design tokens ────────────────────────────────────────────────────────────
const CREAM = "#faf6f1";
const ESPRESSO = "#2c1f0e";
const WARM = "#7a5c38";
const ACCENT = "#c9a96e";

// ─── Static dummy content (hero + editorial only) ─────────────────────────────

const HERO_SLIDES = [
  {
    id: "h1",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90",
    tag: "New Arrival",
    title: "The Quilted\nClassic",
    subtitle: "Refined for modern living",
  },
  {
    id: "h2",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90",
    tag: "SS 2026",
    title: "Summer\nEditorial",
    subtitle: "Light. Airy. Iconic.",
  },
  {
    id: "h3",
    image:
      "https://images.unsplash.com/photo-1591561954555-607968c989ab?w=800&q=90",
    tag: "Bestseller",
    title: "The Tote\nRefined",
    subtitle: "Carry everything beautifully",
  },
];

// Fallback images for categories that don't have imageUrl in the API
const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  Totes:
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300&q=80",
  Clutches:
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=300&q=80",
  Shoulder:
    "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=300&q=80",
  "Mini Bags":
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=80",
  default:
    "https://images.unsplash.com/photo-1590019673771-6e5d17b14e68?w=300&q=80",
};

type ApiProduct = {
  id: string;
  name: string;
  price: number | string;
  images?: string[];
  isFeatured?: boolean;
  styleCode?: string;
  isWishlisted?: boolean;
};

// ─── HeroBanner ───────────────────────────────────────────────────────────────

function HeroBanner() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (active + 1) % HERO_SLIDES.length;
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setActive(next);
    }, 3800);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <View style={hero.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {HERO_SLIDES.map((slide) => (
          <View key={slide.id} style={hero.slide}>
            <Image source={{ uri: slide.image }} style={hero.image} />
            <View style={hero.overlay} />
            <Animated.View style={[hero.textBox, { opacity: fadeAnim }]}>
              <View style={hero.tagRow}>
                <View style={hero.tagPill}>
                  <Text style={hero.tagText}>{slide.tag}</Text>
                </View>
              </View>
              <Text style={hero.title}>{slide.title}</Text>
              <Text style={hero.subtitle}>{slide.subtitle}</Text>
              <TouchableOpacity style={hero.cta}>
                <Text style={hero.ctaText}>Shop Now</Text>
                <Ionicons name="arrow-forward" size={14} color={ESPRESSO} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ))}
      </ScrollView>
      <View style={hero.dots}>
        {HERO_SLIDES.map((_, i) => (
          <View key={i} style={[hero.dot, i === active && hero.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── CategorySection — real data from API ─────────────────────────────────────

function CategorySection({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({});
  const categories: Array<{ id: string; name: string; imageUrl?: string }> =
    categoriesData?.categories || [];

  return (
    <View style={cat.wrapper}>
      <View style={cat.labelRow}>
        <Text style={cat.sectionLabel}>SHOP BY STYLE</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={cat.strip}
      >
        {/* "All" bubble */}
        <TouchableOpacity
          style={cat.item}
          onPress={() => onSelect(null)}
          activeOpacity={0.8}
        >
          <View style={[cat.imgWrapper, !selected && cat.imgWrapperActive]}>
            <Image
              source={{ uri: CATEGORY_IMAGE_FALLBACKS.Totes }}
              style={cat.img}
            />
            <View style={cat.imgDimmer} />
            <Text style={cat.imgLabel}>All</Text>
          </View>
          <Text style={[cat.label, !selected && cat.labelBold]}>All</Text>
        </TouchableOpacity>

        {/* Real categories */}
        {!isLoading &&
          categories.map((c) => {
            const isActive = selected === c.id;
            const imgUrl =
              c.imageUrl ||
              CATEGORY_IMAGE_FALLBACKS[c.name] ||
              CATEGORY_IMAGE_FALLBACKS.default;
            return (
              <TouchableOpacity
                key={c.id}
                style={cat.item}
                onPress={() => onSelect(isActive ? null : c.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[cat.imgWrapper, isActive && cat.imgWrapperActive]}
                >
                  <Image source={{ uri: imgUrl }} style={cat.img} />
                  {isActive && <View style={cat.imgDimmer} />}
                </View>
                <Text style={[cat.label, isActive && cat.labelBold]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* Skeleton */}
        {isLoading &&
          [1, 2, 3, 4].map((k) => (
            <View key={k} style={cat.item}>
              <View style={[cat.imgWrapper, { backgroundColor: "#e8ddd1" }]} />
              <View
                style={{
                  width: 44,
                  height: 9,
                  backgroundColor: "#e8ddd1",
                  borderRadius: 4,
                  marginTop: 5,
                }}
              />
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

// ─── EditorialBanner ──────────────────────────────────────────────────────────

function EditorialBanner() {
  return (
    <View style={edit.wrapper}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=900&q=90",
        }}
        style={edit.image}
      />
      <View style={edit.overlay} />
      <View style={edit.text}>
        <Text style={edit.eyebrow}>THE EDIT · SS 2026</Text>
        <Text style={edit.heading}>Structured{"\n"}Silhouettes</Text>
        <TouchableOpacity style={edit.btn}>
          <Text style={edit.btnText}>Explore Collection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({
  item,
  wishlisted,
  onWishlist,
  onPress,
}: {
  item: ApiProduct;
  wishlisted: boolean;
  onWishlist: () => void;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const imageUri =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : "https://images.unsplash.com/photo-1590019673771-6e5d17b14e68?w=500&q=85";

  return (
    <Animated.View style={{ transform: [{ scale }], width: CARD_WIDTH }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={card.wrapper}
      >
        <View style={card.imgBox}>
          <Image source={{ uri: imageUri }} style={card.img} />
          {item.isFeatured && (
            <View style={card.tagPill}>
              <Text style={card.tagText}>Featured</Text>
            </View>
          )}
          <TouchableOpacity style={card.heart} onPress={onWishlist} hitSlop={8}>
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={18}
              color={wishlisted ? "#c0392b" : "#6b5c44"}
            />
          </TouchableOpacity>
        </View>
        <View style={card.info}>
          <Text style={card.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={card.price}>${Number(item.price).toFixed(2)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch real products — same query as collections.tsx ──
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProductsQuery({
    categoryId: selectedCategory || undefined,
    page: 1,
    limit: 20,
  });

  const wishlist = useAppSelector(
    (state: RootState) => (state.wishlist as { items: string[] }).items || [],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const handleProductPress = (id: string) => router.push(`/product/${id}`);
  const handleWishlist = (id: string) => dispatch(toggleWishlist(id));

  // Real products from API — same mapping as collections.tsx
  const products: ApiProduct[] = (productsData?.products || []).map(
    (p: any) => ({
      ...p,
      isWishlisted: wishlist.includes(p.id),
    }),
  );

  const isFiltering = !!selectedCategory;
  const sectionTitle = isFiltering ? "COLLECTION" : "ALL PRODUCTS";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ACCENT}
          />
        }
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>MAISON</Text>
            <Text style={styles.brandSub}>Timeless Elegance</Text>
          </View>
          <View style={styles.topIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              // onPress={() => router.push("/search" as any)}
            >
              <Ionicons name="search-outline" size={22} color={ESPRESSO} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              // onPress={() => router.push("/cart" as any)}
            >
              <Ionicons name="bag-outline" size={22} color={ESPRESSO} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero carousel ── */}
        <HeroBanner />

        {/* ── Category circles (real API) ── */}
        <CategorySection
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* ── Active filter pill ── */}
        {isFiltering && (
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close-circle" size={14} color={CREAM} />
            <Text style={styles.filterPillText}>Clear filter</Text>
          </TouchableOpacity>
        )}

        {/* ── Section header ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{sectionTitle}</Text>
          {isFetching && !productsLoading && (
            <ActivityIndicator size="small" color={ACCENT} />
          )}
        </View>

        {/* ── Product grid — REAL DATA ── */}
        {productsLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={WARM} />
          </View>
        ) : isError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={32} color={WARM} />
            <Text style={styles.errorText}>Couldn't load products.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-outline" size={48} color="#d4c4b0" />
            <Text style={styles.emptyText}>
              No products in this collection.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                wishlisted={wishlist.includes(item.id)}
                onWishlist={() => handleWishlist(item.id)}
                onPress={() => handleProductPress(item.id)}
              />
            ))}
          </View>
        )}

        {/* ── Editorial banner ── */}
        <EditorialBanner />

        {/* ── Promise strip ── */}
        <View style={styles.promiseRow}>
          {[
            { icon: "ribbon-outline", label: "Handcrafted" },
            { icon: "car-outline", label: "Free Shipping\n$500+" },
            { icon: "return-down-back-outline", label: "Easy Returns" },
          ].map((p) => (
            <View key={p.label} style={styles.promiseItem}>
              <Ionicons name={p.icon as any} size={22} color={WARM} />
              <Text style={styles.promiseText}>{p.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    backgroundColor: CREAM,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2d9cc",
  },
  brand: {
    fontFamily: "serif",
    fontSize: 22,
    letterSpacing: 6,
    color: ESPRESSO,
    fontWeight: "700",
  },
  brandSub: {
    fontSize: 9,
    letterSpacing: 3,
    color: WARM,
    textTransform: "uppercase",
    marginTop: 1,
  },
  topIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e8dd",
    justifyContent: "center",
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: SPACING.lg,
    marginTop: 14,
    gap: 5,
    backgroundColor: ESPRESSO,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillText: { fontSize: 11, color: CREAM, letterSpacing: 0.5 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: WARM,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  loader: { paddingVertical: 40, alignItems: "center" },
  errorBox: { alignItems: "center", paddingVertical: 40, gap: 10 },
  errorText: { fontSize: 13, color: WARM },
  retryBtn: {
    backgroundColor: ESPRESSO,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: { color: CREAM, fontSize: 12, letterSpacing: 1 },
  emptyBox: { paddingVertical: 48, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 13, color: WARM },
  promiseRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: SPACING.lg,
    marginTop: 28,
    paddingVertical: 20,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#e2d9cc",
  },
  promiseItem: { alignItems: "center", gap: 6, flex: 1 },
  promiseText: {
    fontSize: 10,
    color: WARM,
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 14,
  },
});

const hero = StyleSheet.create({
  wrapper: { height: 480, position: "relative" },
  slide: { width: SCREEN_WIDTH, height: 480 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,2,0.42)",
  },
  textBox: { position: "absolute", bottom: 56, left: 24, right: 24 },
  tagRow: { marginBottom: 10 },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  tagText: {
    fontSize: 9,
    letterSpacing: 2,
    color: ESPRESSO,
    fontWeight: "700",
  },
  title: {
    fontFamily: "serif",
    fontSize: 42,
    color: CREAM,
    lineHeight: 48,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(250,246,241,0.75)",
    letterSpacing: 1,
    marginBottom: 20,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: CREAM,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 2,
  },
  ctaText: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: ESPRESSO,
    fontWeight: "700",
  },
  dots: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: { width: 18, backgroundColor: ACCENT },
});

const cat = StyleSheet.create({
  wrapper: { marginTop: 28 },
  labelRow: { paddingHorizontal: SPACING.lg, marginBottom: 14 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: WARM,
    fontWeight: "700",
  },
  strip: { paddingHorizontal: SPACING.lg, gap: 14, paddingBottom: 4 },
  item: { alignItems: "center", gap: 7, width: 76 },
  imgWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#e8ddd1",
  },
  imgWrapperActive: { borderColor: ESPRESSO },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  imgDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44,31,14,0.30)",
  },
  imgLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    color: CREAM,
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    fontSize: 10,
    color: ESPRESSO,
    letterSpacing: 0.5,
    fontWeight: "500",
    textAlign: "center",
  },
  labelBold: { fontWeight: "700" },
});

const edit = StyleSheet.create({
  wrapper: {
    margin: SPACING.lg,
    marginTop: 28,
    borderRadius: 4,
    overflow: "hidden",
    height: 300,
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,6,2,0.52)",
  },
  text: { position: "absolute", bottom: 28, left: 24 },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 3,
    color: ACCENT,
    fontWeight: "700",
    marginBottom: 8,
  },
  heading: {
    fontFamily: "serif",
    fontSize: 34,
    color: CREAM,
    lineHeight: 40,
    fontWeight: "700",
    marginBottom: 16,
  },
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: CREAM,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
  },
  btnText: {
    fontSize: 11,
    color: CREAM,
    letterSpacing: 1.5,
    fontWeight: "600",
  },
});

const card = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
    shadowColor: ESPRESSO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  imgBox: { position: "relative", height: 200 },
  img: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: "#f0e8dd",
  },
  tagPill: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: ESPRESSO,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  tagText: { fontSize: 8, color: CREAM, letterSpacing: 1.5, fontWeight: "700" },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  info: { padding: 12, gap: 4 },
  name: { fontSize: 12, color: ESPRESSO, fontWeight: "600", lineHeight: 17 },
  price: { fontSize: 14, color: WARM, fontWeight: "700" },
});
