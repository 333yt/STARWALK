import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gamepad2,
  Sparkles,
  Award,
  Shirt,
  Compass,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Music,
  Crown
} from 'lucide-react';

const AGENCY_STAGES = [
  {
    name: '🌱 夢想練習室',
    desc: '偶像正在練習室努力進行歌唱與舞蹈特訓，累積基本功！',
    reqPoints: 0,
    bonus: '解鎖練習服造型'
  },
  {
    name: '🔥 街頭公演初登場',
    desc: '在繁華西門町與弘大進行首次街頭街演，吸引最初的一批忠實鐵粉！',
    reqPoints: 500,
    bonus: '開啟街演通告'
  },
  {
    name: '🎤 音樂節目打歌舞台',
    desc: '登上 M Countdown 與音樂銀行打歌！應援手燈第一次在舞台前閃亮！',
    reqPoints: 1200,
    bonus: '解鎖星光閃耀打歌服'
  },
  {
    name: '📺 熱門綜藝固定嘉賓',
    desc: '參加人氣綜藝節目，大展個人魅力與綜藝感，國民知名度暴漲！',
    reqPoints: 2200,
    bonus: '經紀點數加成'
  },
  {
    name: '🏟️ 巨蛋巡演萬人現場',
    desc: '踏上台北小巨蛋與日本巨蛋舞台，全場大合唱萬人紫海應援！',
    reqPoints: 3500,
    bonus: '解鎖深藍天界女帝禮服'
  },
  {
    name: '👑 世界巡迴超級巨星',
    desc: '從練習室走向世界之巔，世界巡迴完售、橫掃各大音樂盛典年度大賞！',
    reqPoints: 5000,
    bonus: '星途傳奇大師稱號'
  }
];

const OUTFITS = [
  {
    id: '粉嫩帽T練舞服',
    name: '粉嫩帽T練舞服',
    img: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
    unlocked: true
  },
  {
    id: '星光閃耀打歌服',
    name: '星光閃耀打歌服',
    img: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
    unlocked: true
  },
  {
    id: '深藍天界女帝禮服',
    name: '深藍天界女帝禮服',
    img: '/src/assets/images/idol_character_superstar_1793698981923.jpg',
    unlocked: true
  }
];

export const CharacterView: React.FC = () => {
  const {
    characterProfile,
    updateCharacterProfile,
    dailyMissions,
    completeDailyMission,
    achievements,
    advanceAgencyStage
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(characterProfile.name);

  const xpMax = characterProfile.level * 50;
  const xpRate = Math.min(100, Math.round((characterProfile.xp / xpMax) * 100));

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateCharacterProfile({ name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const currentAgencyStage = AGENCY_STAGES[characterProfile.agencyStageIndex] || AGENCY_STAGES[0];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-pink-500" />
            <span>🎮 角色養成與經紀養成所</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            解鎖造型衣櫥、成就徽章與偶像經紀成長支線（經驗值嚴格來自自律任務）
          </p>
        </div>
      </div>

      {/* Main Character Showcase Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Visual Avatar with current outfit */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 border-pink-400/80 shadow-2xl shadow-pink-500/20 bg-slate-100 dark:bg-slate-800 relative group">
              <img
                src={characterProfile.avatarUrl}
                alt={characterProfile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-600 text-white shadow-md">
                Lv.{characterProfile.level}
              </span>
            </div>

            {/* Change outfit button quick row */}
            <div className="flex gap-2 mt-3">
              {OUTFITS.map(outfit => (
                <button
                  key={outfit.id}
                  onClick={() =>
                    updateCharacterProfile({
                      currentOutfit: outfit.name,
                      avatarUrl: outfit.img
                    })
                  }
                  title={outfit.name}
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                    characterProfile.currentOutfit === outfit.name
                      ? 'border-pink-500 scale-110 shadow-sm ring-2 ring-pink-500/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={outfit.img} alt={outfit.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats and Info */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              {isEditingName ? (
                <form onSubmit={handleNameSave} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="px-2.5 py-1 text-sm font-bold rounded-lg border border-pink-400 bg-white dark:bg-slate-800"
                  />
                  <button type="submit" className="text-xs font-bold text-pink-500">
                    儲存
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {characterProfile.name}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-slate-400 hover:text-pink-500"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40">
                目前造型：{characterProfile.currentOutfit}
              </span>
            </div>

            {/* XP progress */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  經紀人等級進度
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {characterProfile.xp} / {xpMax} XP ({xpRate}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpRate}%` }}
                />
              </div>
            </div>

            {/* Virtual Currency & Stage */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                <span className="text-purple-600 dark:text-purple-400 text-[11px] block">
                  ✨ 經紀星光幣（虛擬經營點數）
                </span>
                <span className="text-base font-black font-mono text-purple-700 dark:text-purple-300">
                  {characterProfile.agencyPoints} P
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">與真實金錢分開管理</p>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40">
                <span className="text-pink-600 dark:text-pink-400 text-[11px] block">
                  🏢 偶像事務所階段
                </span>
                <span className="text-sm font-black text-pink-700 dark:text-pink-300 truncate block">
                  {currentAgencyStage.name}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">支線不影響演唱會存錢</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Sub-Game Section: 通告中心與舞台養成 */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-500" />
              <span>🎬 偶像經紀通告養成支線（可選玩法）</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              消耗日常自律任務獲得的經紀星光幣，陪伴偶像從小練習室一步步解鎖世界巨蛋舞台！
            </p>
          </div>

          {characterProfile.agencyStageIndex < AGENCY_STAGES.length - 1 && (
            <button
              onClick={advanceAgencyStage}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all"
            >
              進階下一個事務所舞台 🚀
            </button>
          )}
        </div>

        {/* Stages Progression Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {AGENCY_STAGES.map((stg, i) => {
            const isCurrent = i === characterProfile.agencyStageIndex;
            const isUnlocked = i <= characterProfile.agencyStageIndex;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20 shadow-xs'
                    : isUnlocked
                    ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">STAGE 0{i + 1}</span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {stg.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {stg.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                  {stg.bonus}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Hall */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-500" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              🏆 星光成就館
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            解鎖成就保留永久紀錄
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.isUnlocked
                  ? 'border-pink-200 dark:border-pink-900/50 bg-pink-50/30 dark:bg-pink-950/20'
                  : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-xs">
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {ach.title}
                  </h5>
                  {ach.isUnlocked && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500 text-white rounded-md">
                      已達成
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {ach.description}
                </p>
                {ach.unlockedAt && (
                  <span className="text-[9px] text-slate-400 font-mono">
                    達成日期：{ach.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
