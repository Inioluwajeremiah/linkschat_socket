import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CheckBox from "../Components/checkbox";
import { ScrollView } from "react-native-gesture-handler";
import { windowHeight } from "../utils/Dimensions";
import { setIsCompleteOnboarding } from "../Store/slices/onboardingSlice";
import { useDispatch } from "react-redux";

const privacyPolicyData = [
  {
    title: "1. Information We Collect",
    points: [
      {
        title: "A. Personal Information",
        points: [
          "Name, email, phone number (for account creation)",
          "Profile details (username, profile picture, bio)",
          "Contacts (if you enable contact synchronization)",
        ],
      },
      {
        title: "B. Messages & Media",
        points: [
          "Text, images, videos, and files shared in chats (stored securely)",
          "Deleted messages may remain in backups for a limited time",
        ],
      },
      {
        title: "C. Device & Usage Data",
        points: [
          "IP address, device type, operating system",
          "App activity (time spent, features used)",
          "Cookies or similar tracking technologies (for analytics)",
        ],
      },
      {
        title: "D. Location Data (Optional)",
        points: [
          "Only if you enable location-based features (e.g., nearby chat)",
        ],
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    points: [
      "To provide and improve LinksChat services",
      "To personalize your experience",
      "To detect and prevent fraud or abuse",
      "To send notifications (if enabled)",
      "For analytics and app improvements",
    ],
  },
  {
    title: "3. Data Sharing & Disclosure",
    points: [
      "We do not sell your personal data.",
      "Service Providers (hosting, analytics, customer support)",
      "Legal Authorities (if required by law)",
      "Other Users (only what you choose to share in chats)",
    ],
  },
  {
    title: "4. Data Security",
    points: [
      "We implement security measures like encryption (SSL/TLS) to protect your data.",
      "However, no system is 100% secure—use caution when sharing sensitive information.",
    ],
  },
  {
    title: "5. Your Choices & Rights",
    points: [
      "Delete Account: You can request account deletion in settings.",
      "Opt-Out: Disable permissions (location, contacts) in device settings.",
      "Access/Correction: Request a copy of your data or updates via support.",
    ],
  },
  {
    title: "6. Children’s Privacy",
    points: [
      "LinksChat is not intended for users under 13 (or 16 in some regions).",
      "We do not knowingly collect data from children.",
    ],
  },
  {
    title: "7. Policy Changes",
    points: [
      "We may update this policy. Continued use of LinksChat means you accept the revised terms.",
    ],
  },
];

const PrivacyPolicy = ({ navigation }) => {
  const [readmore, setReadmore] = React.useState(false);
  const [checkPrivacyPolicy, setCheckPrivacyPolicy] = React.useState(false);
  const dispatch = useDispatch();
  const TogglePrivacyPolicy = () => {
    setCheckPrivacyPolicy(!checkPrivacyPolicy);
  };

  const ToggleReadMore = () => {
    setReadmore(!readmore);
  };

  const handleCompleteOnboarding = () => {
    if (checkPrivacyPolicy) {
      dispatch(setIsCompleteOnboarding(true));
      navigation.navigate("Login");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ height: windowHeight, flex: 1, paddingHorizontal: 20 }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginVertical: 10,
            color: "#5bbbdf",
            fontFamily: "regular",
          }}
        >
          LinksChat Privacy Policy
        </Text>
        <Text>Last Updated: June 9th, 2025</Text>
        <Text style={{ marginTop: 20 }}>
          Welcome to LinksChat! Your privacy is important to us. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our app. By using **LinksChat, you agree to
          the terms outlined in this policy.
        </Text>
        {readmore && (
          <View>
            {privacyPolicyData.map((item, index) => (
              <View style={{ marginTop: 20 }} key={index}>
                <Text style={{ fontWeight: "bold" }}>{item.title}</Text>

                <View style={{ marginTop: 10 }}>
                  {item.points.map((item, index) => {
                    if (typeof item === "string") {
                      return (
                        <View
                          style={{
                            marginLeft: 10,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            rowGap: 10,
                            marginTop: 6,
                          }}
                          key={index}
                        >
                          <Text>{index + 1}.</Text>
                          <Text style={{ marginLeft: 6, flex: 1 }}>{item}</Text>
                        </View>
                      );
                    }
                    return (
                      <View key={index}>
                        <Text style={{ fontWeight: "bold", marginTop: 6 }}>
                          {item.title}
                        </Text>
                        {item.points.map((subItem, subIndex) => (
                          <View
                            style={{
                              marginLeft: 10,
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",

                              rowGap: 10,
                            }}
                            key={subIndex}
                          >
                            <Text>{subIndex + 1}.</Text>
                            <Text style={{ marginLeft: 6, flex: 1 }}>
                              {subItem}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
        {/* toggle read more button */}
        {readmore ? (
          <TouchableOpacity style={{ marginTop: 10 }} onPress={ToggleReadMore}>
            <Text style={{ textDecorationLine: "underline" }}>Show less</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={{ marginTop: 10 }} onPress={ToggleReadMore}>
            <Text style={{ textDecorationLine: "underline" }}>Read more</Text>
          </TouchableOpacity>
        )}

        {/* check box and privacy policy  */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            rowGap: 16,
            marginTop: 20,
          }}
        >
          <CheckBox
            onPress={TogglePrivacyPolicy}
            isChecked={checkPrivacyPolicy}
          />
          <Text style={{ flex: 1 }}>
            Accept our privacy policy to continue using the app.
          </Text>
        </View>

        {/* Next button */}
        <TouchableOpacity
          disabled={!checkPrivacyPolicy}
          style={{
            marginVertical: 20,
            backgroundColor: "#5bbbdf",
            borderRadius: 10,
            height: 50,
            width: "100%",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            // Android Shadow
            elevation: 5,
          }}
          onPress={handleCompleteOnboarding}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "regular",
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
