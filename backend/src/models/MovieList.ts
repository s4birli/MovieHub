import mongoose from "mongoose";

const MovieListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    originalTitle: String,
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    year: String,
    endYear: String,
    posterPath: String,
    backdropPath: String,
    overview: String,
    voteAverage: Number,
    voteCount: Number,
    popularity: Number,
    originalLanguage: String,
    status: {
        type: String,
        enum: ['watched', 'unwatched'],
        default: 'unwatched'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    genres: {
        type: [String],
        default: []
    }
});

// Aynı kullanıcı için aynı tmdbId'ye sahip film/dizi eklenemez
MovieListSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

export default mongoose.model('MovieList', MovieListSchema, "MovieList"); 