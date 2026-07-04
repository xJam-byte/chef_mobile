import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "../../lib/theme";

interface LegalDocumentRendererProps {
  content: string;
}

export const LegalDocumentRenderer: React.FC<LegalDocumentRendererProps> = ({
  content,
}) => {
  const c = useColors();

  // Parse content into sections based on numbering (e.g., "1. Title")
  const sections = useMemo(() => {
    const lines = content.split("\n");
    const parsedSections: { title: string; body: string[] }[] = [];
    let currentTitle = "";
    let currentBody: string[] = [];

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Check if line looks like a header (Starts with "1. ", "2. ", etc.)
      if (/^\d+\./.test(cleanLine)) {
        // If we have a previous section accumulating, push it
        if (currentTitle || currentBody.length > 0) {
          parsedSections.push({ title: currentTitle, body: currentBody });
        }
        // Start new section
        currentTitle = cleanLine;
        currentBody = [];
      } else {
        // It's body text
        currentBody.push(cleanLine);
      }
    });

    // Push the last section
    if (currentTitle || currentBody.length > 0) {
      parsedSections.push({ title: currentTitle, body: currentBody });
    }

    return parsedSections;
  }, [content]);

  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: c.card,
              borderColor: c.border,
            },
          ]}
        >
          {/* Header */}
          <Text style={[styles.title, { color: c.primary }]}>
            {section.title}
          </Text>

          {/* Divider if needed, or just spacing */}
          <View style={styles.spacer} />

          {/* Body */}
          {section.body.map((paragraph, pIndex) => (
            <Text
              key={pIndex}
              style={[
                styles.paragraph,
                {
                  color: c.text,
                  marginBottom: pIndex === section.body.length - 1 ? 0 : 8, // Space between paragraphs
                },
              ]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  spacer: {
    height: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    opacity: 0.9,
  },
});
