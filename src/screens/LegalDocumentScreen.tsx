import { ScrollView, View } from "react-native";

import { LegalSection, RegistrationHeader } from "../components/shared";

type LegalSectionItem = {
  title: string;
  body: string;
};

type LegalDocumentScreenProps = {
  styles: Record<string, any>;
  title: string;
  description: string;
  sections: LegalSectionItem[];
  onBack: () => void;
};

/**
 * 規約やポリシー画面で共通利用する legal document screen です。
 * 文面のみ差し替えれば画面レイアウトを再利用できます。
 */
export function LegalDocumentScreen({
  styles,
  title,
  description,
  sections,
  onBack,
}: LegalDocumentScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title={title}
        description={description}
        onBack={onBack}
        styles={styles}
      />
      <View style={styles.registrationCard}>
        {sections.map((section) => (
          <LegalSection
            key={section.title}
            title={section.title}
            body={section.body}
            styles={styles}
          />
        ))}
      </View>
    </ScrollView>
  );
}
