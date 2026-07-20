/**
 * График работы шефа: 7 дней, выходной/время работы.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";
import { useColors } from "../lib/theme";
import { PremiumHeader, Button, SelectionModal, Spinner } from "../components/ui";
import { useProfile } from "../lib/hooks";
import { useChefByUserId } from "../lib/hooks/useChefs";
import { useChefSchedule, useSetMySchedule } from "../lib/hooks/useSchedule";
import type { ScheduleDay } from "../lib/api/schedule";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

// Порядок отображения: пн..вс (day_of_week: 1..6, 0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function ChefScheduleScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { data: profile } = useProfile();
  const { data: myChef } = useChefByUserId(profile?.user_id);
  const { data: schedule, isLoading } = useChefSchedule(myChef?.chef_id);
  const saveMutation = useSetMySchedule();

  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [picker, setPicker] = useState<{
    day: number;
    field: "open_time" | "close_time";
  } | null>(null);

  useEffect(() => {
    if (!schedule) return;
    const byDay = new Map(schedule.schedule.map((d) => [d.day_of_week, d]));
    setDays(
      DAY_ORDER.map(
        (dw) =>
          byDay.get(dw) ?? {
            day_of_week: dw,
            open_time: "09:00",
            close_time: "21:00",
            is_day_off: false,
          }
      )
    );
  }, [schedule]);

  const updateDay = (dw: number, patch: Partial<ScheduleDay>) => {
    setDays((prev) =>
      prev.map((d) => (d.day_of_week === dw ? { ...d, ...patch } : d))
    );
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(days);
      showMessage({ message: t("schedule.saved"), type: "success" });
    } catch (e: any) {
      showMessage({
        message: e?.response?.data?.message ?? t("schedule.saveFailed"),
        type: "danger",
      });
    }
  };

  if (isLoading || !days.length) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <PremiumHeader title={t("schedule.title")} backButton />
        <Spinner fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("schedule.title")} backButton />
      <ScrollView contentContainerStyle={styles.scroll}>
        {schedule && (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: schedule.is_open_now
                  ? c.success + "20"
                  : c.error + "20",
              },
            ]}
          >
            <Text
              style={{
                color: schedule.is_open_now ? c.success : c.error,
                fontWeight: "700",
              }}
            >
              {schedule.is_open_now
                ? t("schedule.openNow")
                : t("schedule.closedNow")}
            </Text>
          </View>
        )}

        {days.map((d) => (
          <View
            key={d.day_of_week}
            style={[
              styles.dayRow,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.dayName, { color: c.text }]}>
              {t(`schedule.days.${d.day_of_week}`)}
            </Text>
            {!d.is_day_off ? (
              <View style={styles.timesRow}>
                <TouchableOpacity
                  style={[styles.timeBtn, { backgroundColor: c.pillBg }]}
                  onPress={() =>
                    setPicker({ day: d.day_of_week, field: "open_time" })
                  }
                >
                  <Text style={{ color: c.text, fontWeight: "600" }}>
                    {d.open_time ?? "09:00"}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: c.textMuted }}>—</Text>
                <TouchableOpacity
                  style={[styles.timeBtn, { backgroundColor: c.pillBg }]}
                  onPress={() =>
                    setPicker({ day: d.day_of_week, field: "close_time" })
                  }
                >
                  <Text style={{ color: c.text, fontWeight: "600" }}>
                    {d.close_time ?? "21:00"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ color: c.textMuted, flex: 1, textAlign: "center" }}>
                {t("schedule.dayOff")}
              </Text>
            )}
            <Switch
              value={!d.is_day_off}
              onValueChange={(open) =>
                updateDay(d.day_of_week, { is_day_off: !open })
              }
              trackColor={{ true: c.primary }}
            />
          </View>
        ))}

        <Button
          title={t("schedule.save")}
          onPress={handleSave}
          loading={saveMutation.isPending}
          fullWidth
        />
      </ScrollView>

      <SelectionModal
        visible={!!picker}
        title={
          picker?.field === "open_time"
            ? t("schedule.openTime")
            : t("schedule.closeTime")
        }
        options={TIME_SLOTS.map((ti) => ({ label: ti, value: ti }))}
        selectedValue={
          (picker &&
            (days.find((d) => d.day_of_week === picker.day)?.[picker.field] as
              | string
              | undefined)) ||
          ""
        }
        onSelect={(value) => {
          if (picker) updateDay(picker.day, { [picker.field]: value });
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 10, paddingBottom: 32 },
  statusPill: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 6,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  dayName: { width: 44, fontSize: 14, fontWeight: "700" },
  timesRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
