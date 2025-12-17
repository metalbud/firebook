const llm_response_format = {
  type: "json_schema",
  json_schema: {
    name: "RecipeResponse",
    schema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "A brief message or context for this recipe response.",
        },
        recipe_data: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the recipe.",
            },
            description: {
              type: "string",
              description: "A brief description about the recipe.",
            },
            category: {
              type: "string",
              description:
                "The category under which this recipe falls. Must be one of the predefined categories.",
              enum: [
                "Desserts",
                "Breakfast",
                "Dinner",
                "Appetizers",
                "Soups",
                "Salads",
                "Snacks",
                "Beverages",
                "Vegetarian",
                "Seafood",
                "Kids",
              ],
            },
            ingredients: {
              type: "array",
              items: {
                type: "string",
              },
              description: "A list of ingredients required for the recipe.",
            },
            instructions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: {
                    type: "integer",
                    description: "The step number in the instruction sequence.",
                  },
                  description: {
                    type: "string",
                    description:
                      "Detailed description of the instruction step.",
                  },
                },
                required: ["step", "description"],
              },
              description:
                "An ordered list of cooking instructions, each with a step number and description.",
            },
            nutritional_info: {
              type: "object",
              description:
                "Calorie estimates and other relevant nutritional information.",
              properties: {
                servings: {
                  type: "integer",
                  description: "Number of servings the recipe yields.",
                },
                calories_per_serving: {
                  type: "number",
                  description:
                    "Approximate total calories for one serving (kcal).",
                },
                protein_per_serving: {
                  type: "number",
                  description: "Approximate protein per serving (grams).",
                },
                carbohydrates_per_serving: {
                  type: "number",
                  description: "Approximate carbohydrates per serving (grams).",
                },
                fat_per_serving: {
                  type: "number",
                  description: "Approximate fat per serving (grams).",
                },
              },
              // You can require these fields if you want them mandatory:
              // required: ["calories_per_serving", "servings"]
            },
          },
          required: [
            "title",
            "description",
            "ingredients",
            "instructions",
            "category",
            // If you want to require nutritional_info, uncomment below:
            // "nutritional_info"
          ],
        },
      },
      required: ["description", "recipe_data"],
    },
  },
};

const recipe_list_response_format = {
  type: "json_schema",
  json_schema: {
    name: "RecipeList",
    schema: {
      type: "object",
      properties: {
        assistant_message: {
          type: "string",
          description:
            "A brief description or message from the assistant about the list of recipes.",
        },
        recipes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "A unique identifier for the recipe.",
              },
              title: {
                type: "string",
                description: "The title of the recipe.",
              },
              description: {
                type: "string",
                description: "A short description or summary of the recipe.",
              },
            },
            required: ["id", "title"],
          },
          description: "An array of recipes with their IDs and titles.",
        },
      },
      required: ["assistant_message", "recipes"],
    },
  },
};

module.exports = { llm_response_format, recipe_list_response_format };
