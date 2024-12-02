const errandModel = require("../../models/models.errands");

exports.errandPipeline = async (id) => {
  if (!id) {
    return "Please provide an id";
  }
  try {
    await errandModel.aggregate([
      {
        $match: {
          _id: id,
          status: "Pending",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
  } catch (error) {
    return `Error occurred: ${error.message}`;
  }
};


