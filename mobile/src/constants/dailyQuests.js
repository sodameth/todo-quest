export function generateDailyQuest(seed) {
  const quests = [
    { type: "complete_any", target: 3, desc: "퀘스트 3개 완료하기", emoji: "📋", xp: 60, label: "아무 퀘스트 3개" },
    { type: "complete_hard", target: 1, desc: "어려움 퀘스트 1개 완료하기", emoji: "💪", xp: 80, label: "어려움 1개" },
    { type: "complete_ontime", target: 2, desc: "시간 내에 퀘스트 2개 완료하기", emoji: "⏰", xp: 70, label: "제시간에 2개" },
    { type: "battle_win", target: 1, desc: "전투에서 1회 승리하기", emoji: "⚔️", xp: 50, label: "전투 1승" },
    { type: "combo_reach", target: 3, desc: "3 콤보 달성하기", emoji: "🔥", xp: 60, label: "3 콤보" },
    { type: "use_skill", target: 2, desc: "스킬 2회 사용하기", emoji: "⚡", xp: 40, label: "스킬 2회" },
  ];
  return { ...quests[seed % quests.length], progress: 0, completed: false, day: seed };
}
