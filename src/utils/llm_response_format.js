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
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the ingredient",
                  },
                  amount: {
                    type: "string",
                    description:
                      "The amount in US measurements with units ex. 1 cup",
                  },
                  amount_metric: {
                    type: "string",
                    description:
                      "The amount in metric measurements with units ex. 250g",
                  },
                },
                required: ["name", "amount", "amount_metric"],
              },
              description:
                "A list of ingredients with their measurements in both US and metric units",
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
            },
          },
          required: [
            "title",
            "description",
            "ingredients",
            "instructions",
            "category",
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
      required: ["recipes"],
    },
  },
};

module.exports = { llm_response_format, recipe_list_response_format };
