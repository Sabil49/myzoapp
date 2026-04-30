// app/(tabs)/support.tsx
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactMethod {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

export default function SupportScreen() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: any) =>
    typeof state?.auth === "object" &&
    state.auth !== null &&
    "isAuthenticated" in state.auth
      ? state.auth.isAuthenticated
      : false,
  );
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Allow unauthenticated access but show message for account-specific features
  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I track my order?",
      category: "Orders & Delivery",
      answer:
        "You can track your order from the 'My Orders' section in your account. Once your order ships, you'll receive an email with a tracking number. Tap on the order in the app to see real-time tracking updates, estimated delivery date, and delivery status.",
    },
    {
      id: "2",
      question: "What is your return policy?",
      category: "Returns & Exchanges",
      answer:
        "We offer a 30-day return policy for all luxury bags. Items must be unworn, unused, and in original packaging with all tags, dust bags, and authenticity cards intact. To initiate a return, go to 'My Orders' and select the item you wish to return. Return shipping is free for domestic orders. Refunds are processed within 5-7 business days after we receive your return.",
    },
    {
      id: "3",
      question: "How long does shipping take?",
      category: "Orders & Delivery",
      answer:
        "Standard shipping takes 3-5 business days within the USA. Express shipping (1-2 business days) and next-day delivery options are available at checkout. All orders are shipped with signature confirmation for security. Free standard shipping is offered on orders over $500.",
    },
    {
      id: "4",
      question: "Do you ship internationally?",
      category: "Orders & Delivery",
      answer:
        "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days depending on your location. Shipping costs are calculated at checkout based on destination. Please note that customs duties and taxes may apply based on your country's regulations and are the responsibility of the buyer.",
    },
    {
      id: "5",
      question: "How do I know if a bag is authentic?",
      category: "Product Information",
      answer:
        "All bags sold on Myzo are 100% authentic and sourced directly from authorized distributors. Each luxury bag comes with an authenticity certificate and original packaging. Our team of experts verifies every item before shipping. If you have concerns about authenticity, please contact our support team.",
    },
    {
      id: "6",
      question: "Can I change or cancel my order?",
      category: "Orders & Delivery",
      answer:
        "Orders can be modified or cancelled within 1 hour of placement through the 'My Orders' section. After this window, orders enter our processing system and cannot be changed. If you need urgent assistance, please contact our support team immediately via live chat or phone.",
    },
    {
      id: "7",
      question: "What payment methods do you accept?",
      category: "Payment",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI, net banking, Razorpay, and international payment methods through Stripe. All transactions are secured with 256-bit SSL encryption. We do not store your payment information.",
    },
    {
      id: "8",
      question: "How do I care for my luxury bag?",
      category: "Product Care",
      answer:
        "Each bag comes with specific care instructions. Generally: Store in the provided dust bag in a cool, dry place. Avoid direct sunlight and moisture. Clean with a soft, dry cloth. For leather bags, use leather conditioner periodically. Avoid overloading to maintain shape. Professional cleaning is recommended for deep stains or damage.",
    },
  ];

  const contactMethods: ContactMethod[] = [
    {
      id: "email",
      icon: "mail-outline",
      title: "Email Support",
      description: "support@myzo.com",
      action: () => Linking.openURL("mailto:support@myzo.com"),
    },
    {
      id: "phone",
      icon: "call-outline",
      title: "Phone Support",
      description: "+1 (800) MYZO-BAG",
      action: () => Linking.openURL("tel:+18006696224"),
    },
    {
      id: "whatsapp",
      icon: "logo-whatsapp",
      title: "WhatsApp",
      description: "Chat with us on WhatsApp",
      action: () => Linking.openURL("https://wa.me/18006696224"),
    },
    {
      id: "instagram",
      icon: "logo-instagram",
      title: "Instagram",
      description: "@myzo.official",
      action: () => Linking.openURL("https://instagram.com/myzo.official"),
    },
  ];

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Group FAQs by category
  const faqsByCategory = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.espresso[500]} />
        </TouchableOpacity>
        <Typography variant="h2" style={styles.headerTitle}>
          Help & Support
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Contact Us
          </Typography>
          <Typography variant="body" style={styles.sectionDescription}>
            Our luxury bag experts are here to help
          </Typography>
          <View style={styles.contactGrid}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.contactCard}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View style={styles.contactIcon}>
                  <Ionicons
                    name={method.icon as any}
                    size={28}
                    color={COLORS.espresso[500]}
                  />
                </View>
                <Typography
                  variant="body"
                  style={
                    [
                      styles.contactTitle,
                      { fontFamily: "Inter-SemiBold" },
                    ] as any
                  }
                >
                  {method.title}
                </Typography>
                <Typography
                  variant="caption"
                  color={COLORS.text.muted}
                  style={styles.contactDescription}
                >
                  {method.description}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section by Category */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Frequently Asked Questions
          </Typography>

          {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
            <View key={category} style={styles.faqCategory}>
              <Typography
                variant="body"
                style={
                  [
                    styles.faqCategoryTitle,
                    { fontFamily: "Inter-SemiBold" },
                  ] as any
                }
              >
                {category}
              </Typography>
              <View style={styles.faqList}>
                {categoryFaqs.map((faq, index) => (
                  <View
                    key={faq.id}
                    style={[
                      styles.faqItem,
                      index === categoryFaqs.length - 1 && styles.faqItemLast,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => toggleFaq(faq.id)}
                      style={styles.faqQuestion}
                      activeOpacity={0.7}
                    >
                      <Typography variant="body" style={styles.faqQuestionText}>
                        {faq.question}
                      </Typography>
                      <Ionicons
                        name={
                          expandedFaq === faq.id ? "chevron-up" : "chevron-down"
                        }
                        size={20}
                        color={COLORS.espresso[500]}
                      />
                    </TouchableOpacity>
                    {expandedFaq === faq.id && (
                      <View style={styles.faqAnswer}>
                        <Typography
                          variant="body"
                          color={COLORS.text.secondary}
                          style={styles.faqAnswerText}
                        >
                          {faq.answer}
                        </Typography>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Resources & Policies
          </Typography>
          <View style={styles.linksList}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push("/shipping-policy" as any)}
            >
              <Typography variant="body">Shipping & Delivery Policy</Typography>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push("/return-policy" as any)}
            >
              <Typography variant="body">Return & Exchange Policy</Typography>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push("/authenticity" as any)}
            >
              <Typography variant="body">Authenticity Guarantee</Typography>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push("/care-guide" as any)}
            >
              <Typography variant="body">Bag Care Guide</Typography>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.linkItem, styles.linkItemLast]}
              onPress={() => router.push("/privacy-policy" as any)}
            >
              <Typography variant="body">Privacy Policy</Typography>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursSection}>
          <View style={styles.hoursCard}>
            <Ionicons
              name="time-outline"
              size={24}
              color={COLORS.espresso[500]}
            />
            <View style={styles.hoursContent}>
              <Typography
                variant="body"
                style={
                  [styles.hoursTitle, { fontFamily: "Inter-SemiBold" }] as any
                }
              >
                Customer Support Hours
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Monday - Friday: 9:00 AM - 8:00 PM EST
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Saturday: 10:00 AM - 6:00 PM EST
              </Typography>
              <Typography variant="caption" color={COLORS.text.muted}>
                Sunday: 11:00 AM - 5:00 PM EST
              </Typography>
              <Typography
                variant="caption"
                color={COLORS.espresso[500]}
                style={{ marginTop: 4 }}
              >
                WhatsApp support available 24/7
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    color: COLORS.text.muted,
    marginBottom: SPACING.lg,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  contactCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: "center",
  },
  contactIcon: {
    marginBottom: SPACING.md,
  },
  contactTitle: {
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  contactDescription: {
    textAlign: "center",
  },
  faqCategory: {
    marginBottom: SPACING.lg,
  },
  faqCategoryTitle: {
    color: COLORS.espresso[500],
    marginBottom: SPACING.sm,
  },
  faqList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  faqQuestionText: {
    flex: 1,
  },
  faqAnswer: {
    paddingBottom: SPACING.md,
  },
  faqAnswerText: {
    lineHeight: 22,
  },
  linksList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkItemLast: {
    borderBottomWidth: 0,
  },
  hoursSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  hoursCard: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.cream[100],
    borderRadius: 8,
  },
  hoursContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  hoursTitle: {
    marginBottom: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING["2xl"],
  },
});
