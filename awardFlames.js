/**
 * Award flames to a user.
 * @param {number} userId - The ID of the user.
 * @param {number} flames - The number of flames to award.
 * @param {object} conn - (Optional) Existing database connection.
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise.
 */
const awardFlames = async (userId, flames, conn = null) => {
  if (!userId || flames <= 0) {
    console.error("Invalid parameters for awarding flames:", {
      userId,
      flames,
    });
    return false;
  }

  let connection;
  try {
    // Use provided connection if available, otherwise create a new one
    connection = conn || (await pool.getConnection());

    const result = await connection.query(
      "UPDATE users SET flames = flames + ? WHERE id = ?",
      [flames, userId]
    );

    if (!conn) connection.release(); // Release connection if not passed in

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error awarding flames:", error);
    if (!conn) connection?.release();
    return false;
  }
};

module.exports = { awardFlames };
