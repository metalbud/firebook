const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");
const { awardFlamesToUser } = require("../utils/streakFlames");
const { llmLimiter } = require("../middleware/rateLimiter");
const {
  llm_response_format,
  recipe_list_response_format,
} = require("../utils/llm_response_format");

/* 
|---------------------------------------------------------------------------
| Recipe Question Route
|---------------------------------------------------------------------------
*/
router.post("/recipe-question", llmLimiter, async (req, res) => {
  const { recipeContext, question, conversationHistory = [] } = req.body;

  if (!recipeContext || !question) {
    return res
      .status(400)
      .json({ error: "Recipe context and question are required" });
  }

  try {
    const historyText = conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const response = await fetch(process.env.OPENAI_API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful cooking assistant. You have full knowledge of the recipe being discussed. Answer questions clearly and concisely, focusing on practical cooking advice.",
          },
          {
            role: "user",
            content: `Here is the recipe context:\n${JSON.stringify(
              recipeContext
            )}\n\nConversation history:\n${historyText}\n\nQuestion: ${question}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response from OpenAI:", data);
      return res.status(500).json({
        error: "Failed to process question: Invalid response from API",
        details: data.error?.message || "No answer data returned",
      });
    }
    res.json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Error processing recipe question:", error);
    res.status(500).json({ error: "Failed to process recipe question" });
  }
});

/* 
|---------------------------------------------------------------------------
| Save Recipe Route
|---------------------------------------------------------------------------
*/
router.post("/save-recipe", authenticateToken, async (req, res) => {
  const {
    title,
    description,
    category,
    ingredients,
    instructions,
    nutritional_info,
  } = req.body;

  console.log("🔹 Incoming Save Request:", req.body);

  if (!req.user || !req.user.user_id) {
    console.error("❌ Unauthorized request: User ID missing");
    return res.status(401).json({ error: "Unauthorized: User ID missing." });
  }

  const created_by_user_id = req.user.user_id;
  console.log(`🔹 User ID: ${created_by_user_id}`);

  if (!title || !description || !ingredients || !instructions) {
    console.error("❌ Missing required recipe fields");
    return res.status(400).json({ error: "Missing required recipe fields." });
  }

  const conn = await pool.getConnection();

  try {
    const existingRecipe = await conn.query(
      "SELECT id FROM recipes WHERE title = ? AND created_by_user_id = ?",
      [title, created_by_user_id]
    );

    if (existingRecipe.length > 0) {
      conn.release();
      console.log(`⚠️ User ${created_by_user_id} already saved this recipe.`);
      return res.status(409).json({ error: "Recipe already saved." });
    }

    const query = `
      INSERT INTO recipes (title, description, category, ingredients, instructions, nutritional_info, created_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const queryParams = [
      title,
      description,
      category,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      JSON.stringify(nutritional_info),
      created_by_user_id,
    ];

    const result = await conn.query(query, queryParams);
    const recipeId = Number(result.insertId);

    console.log(`✅ Recipe saved successfully! Recipe ID: ${recipeId}`);

    const flamesEarned = 2;
    await awardFlamesToUser(created_by_user_id, flamesEarned);
    console.log(
      `🔥 Awarded ${flamesEarned} flames to user ${created_by_user_id}`
    );

    await conn.query(
      "UPDATE users SET total_recipes_saved = total_recipes_saved + 1 WHERE id = ?",
      [created_by_user_id]
    );
    console.log(
      `📊 Updated total recipes saved for user ${created_by_user_id}`
    );

    conn.release();

    res.status(200).json({
      message: "Recipe saved successfully!",
      recipeId,
      flamesEarned,
      totalRecipesSaved: "+1",
    });
  } catch (err) {
    console.error("❌ Database Error:", err);
    console.error(`SQL Error Code: ${err.code}, Message: ${err.sqlMessage}`);
    res.status(500).json({
      error: "Failed to save recipe.",
      details: err.sqlMessage,
    });
  }
});

/* 
|---------------------------------------------------------------------------
| Random Recipes Route
|---------------------------------------------------------------------------
*/
router.get("/random-recipes", async (req, res) => {
  console.log("triggered /random-recipes");
  const limit = req.query.limit || 5;
  const query = `SELECT * FROM recipes ORDER BY RAND() LIMIT ?`;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(query, [parseInt(limit)]);
    conn.release();

    res.status(200).json({ recipes: rows });
  } catch (err) {
    console.error("Error fetching random recipes:", err);
    res.status(500).json({ error: "Failed to fetch random recipes." });
  }
});

/* 
|---------------------------------------------------------------------------
| Suggested Recipes Route
|---------------------------------------------------------------------------
*/
router.post("/suggested-recipes", llmLimiter, async (req, res) => {
  console.log("triggered /suggested-recipes");
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body." });
  }

  try {
    const response = await fetch(process.env.OPENAI_API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a culinary assistant. Provide a list of recipes in JSON format.",
          },
          {
            role: "user",
            content: `Generate a list of recipes for: ${prompt}`,
          },
        ],
        response_format: recipe_list_response_format,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid response from OpenAI:", data);
      return res.status(500).json({
        error: "Failed to fetch recipes: Invalid response from API",
        details: data.error?.message || "No recipe data returned",
      });
    }
    try {
      const recipes = JSON.parse(data.choices[0].message.content);
      res.json(recipes);
    } catch (parseError) {
      console.error("Error parsing recipe data:", parseError);
      return res.status(500).json({
        error: "Failed to parse recipe data",
        details: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes." });
  }
});

/* 
|---------------------------------------------------------------------------
| Recipe Details Route
|---------------------------------------------------------------------------
*/
router.post("/fetch-recipe-details", async (req, res) => {
  console.log("Running fetch-recipe-details");
  const { recipeTitle } = req.body;

  if (!recipeTitle) {
    console.log("Error: Recipe title is missing");
    return res.status(400).json({ error: "Recipe title is required" });
  }

  try {
    const response = await fetch(process.env.OPENAI_API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a culinary expert. Provide a detailed recipe in JSON format with structured ingredients (name, amount, amount_metric) based on the user prompt.",
          },
          {
            role: "user",
            content: `Provide a detailed recipe for: ${recipeTitle}`,
          },
        ],
        response_format: llm_response_format,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    let rawContent = data.choices[0]?.message?.content?.trim();

    if (!rawContent) {
      console.error("No valid response from OpenAI.");
      return res
        .status(500)
        .json({ error: "Invalid response from OpenAI API" });
    }

    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```[a-z]*\n/, "").replace(/```$/, "");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return res.status(500).json({ error: "Failed to parse recipe details" });
    }

    if (Array.isArray(parsedContent.recipe_data?.ingredients)) {
      parsedContent.recipe_data.ingredients =
        parsedContent.recipe_data.ingredients
          .map((ingredient) => {
            if (
              typeof ingredient === "object" &&
              ingredient.name &&
              ingredient.amount &&
              ingredient.amount_metric
            ) {
              return {
                name: ingredient.name.trim(),
                amount: ingredient.amount.trim(),
                amount_metric: ingredient.amount_metric.trim(),
              };
            } else {
              console.warn(
                "❌ Unexpected ingredient format - Skipping:",
                JSON.stringify(ingredient, null, 2)
              );
              return null;
            }
          })
          .filter(Boolean);
    } else {
      console.error(
        "❌ Invalid ingredients format:",
        JSON.stringify(parsedContent.recipe_data?.ingredients, null, 2)
      );
      parsedContent.recipe_data.ingredients = [];
    }
    console.log(parsedContent);
    res.json(parsedContent);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    res.status(500).json({ error: "Failed to fetch recipe details" });
  }
});

/* 
|---------------------------------------------------------------------------
| Get Saved Recipe Route
|---------------------------------------------------------------------------
*/
router.post("/get-saved-recipe", async (req, res) => {
  const { recipeId, recipeTitle } = req.body;

  if (!recipeId && !recipeTitle) {
    console.log("❌ No recipe identifier provided");
    return res
      .status(400)
      .json({ error: "Either recipeId or recipeTitle is required" });
  }

  try {
    const conn = await pool.getConnection();
    let recipes;
    if (recipeId) {
      console.log(`🔍 Querying database for recipe with id: ${recipeId}`);
      recipes = await conn.query("SELECT * FROM recipes WHERE id = ?", [
        recipeId,
      ]);
    } else {
      console.log(
        `🔍 Querying database for recipe with title: "${recipeTitle}"`
      );
      recipes = await conn.query("SELECT * FROM recipes WHERE title = ?", [
        recipeTitle,
      ]);
    }

    conn.release();

    if (!recipes || recipes.length === 0) {
      console.log(`❌ Recipe not found`);
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = recipes[0];
    console.log(`✅ Recipe found: "${recipe.title}"`);

    try {
      const ingredients =
        typeof recipe.ingredients === "string"
          ? JSON.parse(recipe.ingredients)
          : recipe.ingredients;
      const instructions =
        typeof recipe.instructions === "string"
          ? JSON.parse(recipe.instructions)
          : recipe.instructions;
      const nutritional_info = recipe.nutritional_info
        ? typeof recipe.nutritional_info === "string"
          ? JSON.parse(recipe.nutritional_info)
          : recipe.nutritional_info
        : null;

      const formattedResponse = {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        ingredients: ingredients,
        instructions: instructions,
        nutritional_info: nutritional_info,
      };

      console.log(`✅ Successfully formatted recipe response`);
      res.json(formattedResponse);
    } catch (parseError) {
      console.error("❌ Error parsing recipe data:", parseError);
      console.error("Recipe data:", recipe);
      res.status(500).json({
        error: "Failed to parse recipe data",
        details: parseError.message,
      });
    }
  } catch (err) {
    console.error("❌ Database error fetching saved recipe:", err);
    res.status(500).json({
      error: "Failed to fetch recipe",
      details: err.message,
    });
  }
});

/* 
|---------------------------------------------------------------------------
| Track Share Route
|---------------------------------------------------------------------------
*/
router.post("/track-share", authenticateToken, async (req, res) => {
  const { recipe_id } = req.body;
  console.log(`📱 User ${req.user.user_id} is sharing recipe ${recipe_id}`);

  try {
    const conn = await pool.getConnection();
    console.log(`📝 Recording share in database...`);
    await conn.query(
      "INSERT INTO user_shares (user_id, recipe_id, shared_date) VALUES (?, ?, CURRENT_DATE)",
      [req.user.user_id, recipe_id]
    );
    console.log(`✅ Share recorded successfully`);

    console.log(`🔥 Awarding flame to user ${req.user.user_id}...`);
    await awardFlamesToUser(req.user.user_id, 1);
    console.log(`✨ Flame awarded successfully`);

    conn.release();

    console.log(`🎉 Share process completed for user ${req.user.user_id}`);
    res.status(200).json({
      message: "Share tracked successfully",
      flamesAwarded: 1,
    });
  } catch (err) {
    console.error("❌ Error tracking share:", err);
    console.error(`- User ID: ${req.user.user_id}`);
    console.error(`- Recipe ID: ${recipe_id}`);
    console.error(`- Error details:`, err);
    res.status(500).json({ error: "Failed to track share" });
  }
});

/* 
|---------------------------------------------------------------------------
| Submit Review Route
|---------------------------------------------------------------------------
*/
router.post("/submit-review", authenticateToken, async (req, res) => {
  const { recipe_id, rating, comment } = req.body;

  if (!recipe_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Invalid rating or missing data." });
  }

  try {
    const conn = await pool.getConnection();
    const recipeCheck = await conn.query(
      "SELECT id FROM recipes WHERE id = ?",
      [recipe_id]
    );
    if (recipeCheck.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Recipe not found." });
    }

    const existingReview = await conn.query(
      "SELECT id FROM reviews WHERE recipe_id = ? AND user_id = ?",
      [recipe_id, req.user.user_id]
    );
    if (existingReview.length > 0) {
      conn.release();
      return res
        .status(409)
        .json({ error: "You have already reviewed this recipe." });
    }

    await conn.query(
      "INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [recipe_id, req.user.user_id, rating, comment]
    );

    await awardFlamesToUser(req.user.user_id, 3);

    conn.release();
    console.log(
      `✅ User ${req.user.user_id} submitted a review for Recipe ${recipe_id}`
    );

    res
      .status(201)
      .json({ message: "Review submitted successfully!", flamesEarned: 5 });
  } catch (err) {
    console.error("❌ Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review." });
  }
});

/* 
|---------------------------------------------------------------------------
| Get Reviews Route
|---------------------------------------------------------------------------
*/
router.get("/reviews/:recipe_id", async (req, res) => {
  const { recipe_id } = req.params;

  try {
    const conn = await pool.getConnection();
    const reviews = await conn.query(
      `SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at, 
              users.username 
       FROM reviews 
       JOIN users ON reviews.user_id = users.id
       WHERE reviews.recipe_id = ? 
       ORDER BY reviews.created_at DESC`,
      [recipe_id]
    );
    conn.release();

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

/* 
|---------------------------------------------------------------------------
| Get User Reviews Route
|---------------------------------------------------------------------------
*/
router.get("/user-reviews", authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const reviews = await conn.query(
      `SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at, 
              recipes.title AS recipe_title 
       FROM reviews 
       JOIN recipes ON reviews.recipe_id = recipes.id
       WHERE reviews.user_id = ? 
       ORDER BY reviews.created_at DESC`,
      [req.user.user_id]
    );
    conn.release();

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("❌ Error fetching user reviews:", err);
    res.status(500).json({ error: "Failed to fetch user reviews." });
  }
});

module.exports = router;
