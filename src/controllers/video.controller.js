import { asyncHandler } from "../utils/asyncHandler";

const getAllVideos = asyncHandler(async(req,res)=>{
    let {
        page=1,
        limit=10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.params

    page = parseInt(page)
    limit = parseInt(limit)

    skip = (page - 1)*limit;

    const filter = {};

    // Search query
    if (query) {
        filter.title = {
            $regex: query,
            $options: "i"
        };
    }

    // Filter by user
    if (userId) {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user id");
        }

        filter.owner = userId;
    }

    // Dynamic sorting
    const sortOptions = {};

    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    // Fetch videos
    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate(
        "owner",
        "fullname username avatar"
    );

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );

});
    
const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;

    // Validate fields
    if (
        !title || title.trim() === "" ||
        !description || description.trim() === ""
    ) {
        throw new ApiError(
            400,
            "Title and description are required"
        );
    }

    // Get video file local path
    const videoLocalPath = req.files?.videoFile?.[0]?.path;

    // Get thumbnail local path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    // Validate files
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

    // Upload thumbnail to Cloudinary
    const uploadedThumbnail = await uploadOnCloudinary(
        thumbnailLocalPath
    );

    // Validate uploads
    if (!uploadedVideo) {
        throw new ApiError(
            500,
            "Failed to upload video"
        );
    }

    if (!uploadedThumbnail) {
        throw new ApiError(
            500,
            "Failed to upload thumbnail"
        );
    }

    // Create video document
    const video = await Video.create({

        title,
        description,

        videoFile: uploadedVideo.url,

        thumbnail: uploadedThumbnail.url,

        owner: req.user?._id,

        duration: uploadedVideo.duration || 0,

        isPublished: true

    });

    // Fetch created video with owner details
    const createdVideo = await Video.findById(video._id)
    .populate(
        "owner",
        "fullname username avatar"
    );

    return res.status(201)
    .json(
        new ApiResponse(
            201,
            createdVideo,
            "Video published successfully"
        )
    );

});

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find video
    const video = await Video.findById(videoId)
    .populate(
        "owner",
        "fullname username avatar"
    );

    // Check video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    );

});


const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const { title, description } = req.body;

    // Validate video id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find video
    const video = await Video.findById(videoId);

    // Check video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ownership check
    if (
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only owner can update video"
        );
    }

    // Update title if provided
    if (title && title.trim() !== "") {
        video.title = title;
    }

    // Update description if provided
    if (description && description.trim() !== "") {
        video.description = description;
    }

    // Check thumbnail file
    const thumbnailLocalPath =
        req.file?.path;

    // Upload new thumbnail if provided
    if (thumbnailLocalPath) {

        const uploadedThumbnail =
            await uploadOnCloudinary(
                thumbnailLocalPath
            );

        if (!uploadedThumbnail) {
            throw new ApiError(
                500,
                "Thumbnail upload failed"
            );
        }

        video.thumbnail =
            uploadedThumbnail.url;
    }

    // Save updated video
    await video.save();

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    );

});


const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find video
    const video = await Video.findById(videoId);

    // Check video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ownership check
    if (
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only owner can delete video"
        );
    }

    // Delete video
    await video.deleteOne();

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    );

});


const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find video
    const video = await Video.findById(videoId);

    // Check video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Ownership check
    if (
        video.owner.toString() !==
        req.user?._id.toString()
    ) {
        throw new ApiError(
            403,
            "Only owner can change publish status"
        );
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    // Save changes
    await video.save();

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Publish status toggled successfully"
        )
    );

});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}