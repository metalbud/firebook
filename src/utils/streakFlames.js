const pool = require("../config/database");

const awardFlamesToUser = async (user_id, award) => {
  try {
    const conn = await pool.getConnection();
    await conn.query("UPDATE users SET flames = flames + ? WHERE id = ?", [
      award,
      user_id,
    ]);
    conn.release();
    console.log(`🔥 Awarded ${award} flames to user ${user_id}`);
  } catch (err) {
    console.error("Error awarding flames:", err);
  }
};

const checkAndAwardStreakFlames = async (user_id, lastLogin, streakDays) => {
  try {
    // Helper function to format local dates as 'YYYY-MM-DD'
    const getLocalDateStr = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Normalize lastLogin to 'YYYY-MM-DD' format
    const normalizeDate = (dateStr) => {
      const date = new Date(dateStr);
      return getLocalDateStr(date);
    };

    // Get today's date in local time
    const today = new Date();
    const todayStr = getLocalDateStr(today);

    // Normalize lastLogin for comparison
    const normalizedLastLogin = normalizeDate(lastLogin);

    console.log(`🕒 Debugging Time Variables:`);
    console.log(`- User ID: ${user_id}`);
    console.log(`- Last Login (from DB): ${lastLogin}`);
    console.log(`- Normalized Last Login: ${normalizedLastLogin}`);
    console.log(`- Today (local): ${todayStr}`);
    console.log(`- Current Time (local): ${today.toLocaleString()}`);
    console.log(`- Current Time (UTC): ${today.toISOString()}`);

    if (normalizedLastLogin === todayStr) {
      console.log(`✅ User ${user_id} already received streak flames today.`);
      return { flamesAwarded: 0, streakDays };
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    console.log(`- Yesterday (local): ${yesterdayStr}`);

    let newStreakDays =
      normalizedLastLogin === yesterdayStr ? streakDays + 1 : 1;

    console.log(`- New Streak Days: ${newStreakDays}`);

    let dailyBonus = 1;
    let streakBonus = 0;

    if (newStreakDays % 7 === 0) streakBonus = 5;
    if (newStreakDays % 30 === 0) streakBonus = 9;

    const totalFlamesAwarded = dailyBonus + streakBonus;

    console.log(`- Daily Bonus: ${dailyBonus}`);
    console.log(`- Streak Bonus: ${streakBonus}`);
    console.log(`- Total Flames Awarded: ${totalFlamesAwarded}`);

    const conn = await pool.getConnection();
    await conn.query(
      "UPDATE users SET flames = flames + ?, streak_days = ? WHERE id = ?",
      [totalFlamesAwarded, newStreakDays, user_id]
    );

    await conn.query("UPDATE users SET last_login = ? WHERE id = ?", [
      todayStr,
      user_id,
    ]);

    conn.release();

    console.log(
      `🔥 Awarded ${totalFlamesAwarded} flames to user ${user_id} (Streak: ${newStreakDays} days)`
    );

    return { flamesAwarded: totalFlamesAwarded, streakDays: newStreakDays };
  } catch (err) {
    console.error("❌ Error checking and awarding streak flames:", err);
    console.error(`- User ID: ${user_id}`);
    console.error(`- Last Login: ${lastLogin}`);
    console.error(`- Streak Days: ${streakDays}`);
    return { flamesAwarded: 0, streakDays };
  }
};

module.exports = {
  awardFlamesToUser,
  checkAndAwardStreakFlames,
};
