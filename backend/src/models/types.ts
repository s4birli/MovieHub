import { Request, Response, NextFunction } from 'express';

export interface MovieListQuery {
    page?: number;
    limit?: number;
    genres?: string[];
    mediaType?: 'movie' | 'tv';
    status?: 'watching' | 'completed' | 'plan-to-watch';
    sortBy?: 'title' | 'rating' | 'year';
    sortOrder?: 'asc' | 'desc';
}

export interface AuthRequest extends Request {
    user?: { id: string };
}

export type CustomRequestHandler<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = MovieListQuery
> = (
    req: AuthRequest,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<any>; 