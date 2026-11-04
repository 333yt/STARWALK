import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gamepad2,
  Award,
  CheckCircle2,
  Lock,
  Music
} from 'lucide-react';
import { HandDrawnSticker } from '../components/HandDrawnSticker';

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
    img: '/src/assets/images/idol_character_trainee_1793698980118.jpg'
  },
  {
    id: '星光閃耀打歌服',
    name: '星光閃耀打歌服',
    img: '/src/assets/images/idol_character_stage_star_1793698980767.jpg'
  },
  {
    id: '深藍天界女帝禮服',
    name: '深藍天界女帝禮服',
    img: '/src/assets/images/idol_character_superstar_1793698981923.jpg'
  }
];

export const CharacterView: React.FC = () => {
  const {
    characterProfile,
    updateCharacterProfile,
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
      {/* Header Banner */}
      <div className="sketch-card bg-[#FFF9E6] p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div
          className="washi-tape-pink absolute -top-3 left-10 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />
        <div className="flex items-center gap-3.5">
          <HandDrawnSticker sticker="sparkles" size={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#4A3728]">
              👗 角色養成與經紀養成所
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#8C7365]">
              解鎖造型衣櫥、成就徽章與偶像經紀成長支線！
            </p>
          </div>
        </div>
      </div>

      {/* Main Character Showcase Card */}
      <div className="sketch-card bg-white p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Visual Avatar with current outfit */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 border-[#4A3728] shadow-[4px_4px_0px_#4A3728] bg-[#FFEBF2] relative group p-1">
              <img
                src={characterProfile.avatarUrl}
                alt={characterProfile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF5C8A] text-white border-2 border-[#4A3728] shadow-xs">
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
                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 border-[#4A3728] transition-all cursor-pointer ${
                    characterProfile.currentOutfit === outfit.name
                      ? 'scale-110 shadow-[2px_2px_0px_#4A3728] ring-2 ring-[#FF5C8A]'
                      : 'opacity-60 hover:opacity-100'
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
                    className="px-3 py-1 text-sm font-black rounded-xl border-2 border-[#4A3728] bg-white text-[#4A3728]"
                  />
                  <button type="submit" className="sticker-btn px-3 py-1 text-xs font-black text-white bg-[#FF5C8A]">
                    儲存
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#4A3728]">
                    {characterProfile.name}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-[#8C7365] hover:text-[#FF3B75] cursor-pointer"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFE3EC] text-[#FF5C8A] border-2 border-[#4A3728]">
                目前造型：{characterProfile.currentOutfit}
              </span>
            </div>

            {/* XP progress */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#8C7365]">經紀人等級進度</span>
                <span className="font-mono-num text-[#8A5CF5] font-black">
                  {characterProfile.xp} / {xpMax} XP ({xpRate}%)
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
                <div
                  className="h-full crayon-stripe-pink rounded-full transition-all duration-500"
                  style={{ width: `${xpRate}%` }}
                />
              </div>
            </div>

            {/* Virtual Currency & Stage */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F2EAFF] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
                <span className="text-[#8A5CF5] text-[11px] font-black block">
                  ✨ 經紀星光幣（經營點數）
                </span>
                <span className="text-base font-black font-mono-num text-[#4A3728]">
                  {characterProfile.agencyPoints} P
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFEBF2] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
                <span className="text-[#FF5C8A] text-[11px] font-black block">
                  🏢 偶像事務所階段
                </span>
                <span className="text-sm font-black text-[#4A3728] truncate block">
                  {currentAgencyStage.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Sub-Game Section */}
      <div className="sketch-card bg-white p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3]">
          <div>
            <h4 className="font-black text-sm text-[#4A3728] flex items-center gap-2">
              <Music className="w-4 h-4 text-[#8A5CF5]" />
              <span>🎬 偶像經紀通告養成支線</span>
            </h4>
            <p className="text-[11px] font-bold text-[#8C7365] mt-0.5">
              陪伴偶像從小練習室一步步解鎖世界巨蛋舞台！
            </p>
          </div>

          {characterProfile.agencyStageIndex < AGENCY_STAGES.length - 1 && (
            <button
              onClick={advanceAgencyStage}
              className="sticker-btn px-4 py-1.5 text-xs font-black text-white bg-[#8A5CF5] rounded-full"
            >
              進階下一個舞台 🚀
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
                className={`p-3.5 rounded-2xl border-2 border-[#4A3728] text-left flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#FFE3EC] shadow-[3px_3px_0px_#4A3728] -translate-y-0.5'
                    : isUnlocked
                    ? 'bg-[#E4FBF0]'
                    : 'bg-[#FFFDF7] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black font-mono-num text-[#8C7365]">STAGE 0{i + 1}</span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9E73] stroke-[3]" />
                    ) : (
                      <Lock className="w-3 h-3 text-[#8C7365]" />
                    )}
                  </div>
                  <h5 className="text-xs font-black text-[#4A3728] mt-1">
                    {stg.name}
                  </h5>
                  <p className="text-[10px] font-bold text-[#8C7365] mt-1 line-clamp-2">
                    {stg.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-dashed border-[#E6D7C3] text-[10px] text-[#FF5C8A] font-black">
                  {stg.bonus}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Hall */}
      <div className="sketch-card bg-white p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF5C8A]" />
            <h4 className="font-black text-sm text-[#4A3728]">
              🏆 星光成就館
            </h4>
          </div>
          <span className="text-xs font-bold text-[#8C7365]">
            成就記錄永久保存
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border-2 border-[#4A3728] flex items-center gap-3 transition-all ${
                ach.isUnlocked
                  ? 'bg-[#FFEBF2] shadow-[2.5px_2.5px_0px_#4A3728]'
                  : 'bg-[#FFFDF7] opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border-2 border-[#4A3728] flex items-center justify-center text-xl shrink-0 shadow-xs">
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-black text-[#4A3728] truncate">
                    {ach.title}
                  </h5>
                  {ach.isUnlocked && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#1E9E73] text-white rounded-md">
                      已達成
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-[#8C7365] mt-0.5 truncate">
                  {ach.description}
                </p>
                {ach.unlockedAt && (
                  <span className="text-[9px] text-[#8C7365] font-mono-num">
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
