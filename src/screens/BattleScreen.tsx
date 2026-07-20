/**
 * «Битва рецептов»: текущие битвы по категориям, лидерборд, прошлые победители.
 * Шеф может подать своё блюдо в активную битву.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { useColors } from "../lib/theme";
import {
  PremiumHeader,
  Spinner,
  Badge,
  Avatar,
  SelectionModal,
} from "../components/ui";
import {
  useCurrentBattles,
  useBattleEntries,
  useBattleHistory,
  useSubmitBattleEntry,
} from "../lib/hooks/useBattles";
import { useProfile } from "../lib/hooks";
import { useChefByUserId } from "../lib/hooks/useChefs";
import { useChefDishes } from "../lib/hooks/useDishes";
import type { Battle } from "../lib/api/battles";

type Tab = "current" | "history";

export default function BattleScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const [tab, setTab] = useState<Tab>("current");
  const [selectedBattleId, setSelectedBattleId] = useState<number | null>(null);
  const [dishPickerBattle, setDishPickerBattle] = useState<Battle | null>(null);

  const { data: profile } = useProfile();
  const roleIsChef = profile?.role === "chef";
  const { data: myChef } = useChefByUserId(
    roleIsChef ? profile?.user_id : undefined
  );
  const { data: myDishesResp } = useChefDishes(myChef?.chef_id);
  const myDishes: any[] = Array.isArray(myDishesResp)
    ? myDishesResp
    : (myDishesResp as any)?.data ?? [];

  const { data: battles, isLoading } = useCurrentBattles();
  const { data: leaderboard } = useBattleEntries(selectedBattleId ?? undefined);
  const { data: history } = useBattleHistory();
  const submitMutation = useSubmitBattleEntry();

  const handleSubmit = async (dishId: number) => {
    if (!dishPickerBattle) return;
    try {
      await submitMutation.mutateAsync({
        battleId: dishPickerBattle.battle_id,
        dishId,
      });
      showMessage({ message: t("battle.entrySubmitted"), type: "success" });
    } catch (e: any) {
      showMessage({
        message:
          e?.response?.data?.message ?? t("battle.entryFailed"),
        type: "danger",
      });
    } finally {
      setDishPickerBattle(null);
    }
  };

  const renderBattleCard = (battle: Battle) => {
    const isOpen = selectedBattleId === battle.battle_id;
    const eligibleDishes = myDishes.filter(
      (d: any) => (d.type ?? "") === battle.category
    );
    return (
      <View
        key={battle.battle_id}
        style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.theme, { color: c.text }]}>{battle.theme}</Text>
            <Text style={[styles.category, { color: c.textSecondary }]}>
              {t("battle.category")}: {battle.category} · {battle.month}
            </Text>
          </View>
          <Badge
            text={t("battle.entriesCount", {
              count: battle._count?.entries ?? 0,
            })}
            variant="info"
            size="sm"
          />
        </View>

        {!!battle.themeDishes?.length && (
          <View style={styles.trendRow}>
            <Ionicons name="trending-up" size={14} color={c.primary} />
            <Text style={[styles.trendText, { color: c.textSecondary }]}>
              {battle.themeDishes.map((d) => d.name).join(" · ")}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.pillBg }]}
            onPress={() =>
              setSelectedBattleId(isOpen ? null : battle.battle_id)
            }
          >
            <Ionicons name="podium-outline" size={16} color={c.primary} />
            <Text style={[styles.actionText, { color: c.primary }]}>
              {t("battle.leaderboard")}
            </Text>
          </TouchableOpacity>

          {roleIsChef &&
            (battle.my_entry ? (
              <Badge text={t("battle.alreadyEntered")} variant="success" size="sm" />
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.primary }]}
                onPress={() => setDishPickerBattle(battle)}
                disabled={eligibleDishes.length === 0}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={[styles.actionText, { color: "#fff" }]}>
                  {eligibleDishes.length
                    ? t("battle.submitEntry")
                    : t("battle.noEligibleDishes")}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {isOpen && leaderboard?.battle.battle_id === battle.battle_id && (
          <View style={[styles.leaderboard, { borderTopColor: c.divider }]}>
            {leaderboard.entries.length === 0 && (
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                {t("battle.noEntries")}
              </Text>
            )}
            {leaderboard.entries.map((e, i) => (
              <View key={e.entry_id} style={styles.entryRow}>
                <Text style={[styles.position, { color: c.textMuted }]}>
                  {i + 1}
                </Text>
                {e.dish?.picture && e.dish.picture !== "n" ? (
                  <Image
                    source={{ uri: e.dish.picture }}
                    style={styles.dishPic}
                  />
                ) : (
                  <View style={[styles.dishPic, { backgroundColor: c.pillBg }]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.entryDish, { color: c.text }]}>
                    {e.dish?.name}
                  </Text>
                  <Text style={[styles.entryChef, { color: c.textSecondary }]}>
                    {e.chef?.users?.name}
                  </Text>
                </View>
                <Text style={[styles.score, { color: c.primary }]}>
                  {e.score}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("battle.title")} backButton />

      <View style={[styles.tabs, { backgroundColor: c.card }]}>
        {(["current", "history"] as Tab[]).map((tb) => (
          <TouchableOpacity
            key={tb}
            style={[
              styles.tab,
              tab === tb && { backgroundColor: c.primary + "20" },
            ]}
            onPress={() => setTab(tb)}
          >
            <Text
              style={{
                color: tab === tb ? c.primary : c.textMuted,
                fontWeight: "600",
              }}
            >
              {t(`battle.tab_${tb}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <Spinner fullScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {tab === "current" ? (
            battles?.length ? (
              battles.map(renderBattleCard)
            ) : (
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                {t("battle.noActive")}
              </Text>
            )
          ) : history?.length ? (
            history.map((b) => (
              <View
                key={b.battle_id}
                style={[
                  styles.card,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <Text style={[styles.category, { color: c.textSecondary }]}>
                  {b.month} · {b.category}
                </Text>
                <Text style={[styles.theme, { color: c.text }]}>{b.theme}</Text>
                {b.winner ? (
                  <View style={styles.winnerRow}>
                    <Ionicons name="trophy" size={18} color="#D4A017" />
                    <Avatar
                      uri={b.winner.chef?.users?.profile_pic ?? undefined}
                      name={b.winner.chef?.users?.name}
                      size="sm"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.entryDish, { color: c.text }]}>
                        {b.winner.dish?.name}
                      </Text>
                      <Text style={[styles.entryChef, { color: c.textSecondary }]}>
                        {b.winner.chef?.users?.name}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: c.textMuted }]}>
                    {t("battle.noWinner")}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              {t("battle.noHistory")}
            </Text>
          )}
        </ScrollView>
      )}

      <SelectionModal
        visible={!!dishPickerBattle}
        title={t("battle.pickDish")}
        options={myDishes
          .filter((d: any) => (d.type ?? "") === (dishPickerBattle?.category ?? ""))
          .map((d: any) => ({ label: d.name, value: String(d.dish_id) }))}
        selectedValue=""
        onSelect={(value: string) => handleSubmit(Number(value))}
        onClose={() => setDishPickerBattle(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  theme: { fontSize: 17, fontWeight: "700" },
  category: { fontSize: 13, marginTop: 2 },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  trendText: { fontSize: 13, flex: 1 },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
  leaderboard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 8,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  position: { width: 18, fontSize: 14, fontWeight: "700" },
  dishPic: { width: 40, height: 40, borderRadius: 8 },
  entryDish: { fontSize: 14, fontWeight: "600" },
  entryChef: { fontSize: 12 },
  score: { fontSize: 16, fontWeight: "800" },
  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  emptyText: { textAlign: "center", fontSize: 14, marginVertical: 12 },
});
