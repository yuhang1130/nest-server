import { AuthService } from '../../auth/auth.service';
import { remove as removeHeaderCookie } from '../../utils/req-header-cookie';
import { CustomRequest } from '../session-store/session-dto';
import { NextFunction } from 'express';

export const JwtParseMiddleware = (authService: AuthService, sessionName: string) => {
	return async (req: CustomRequest, _, next: NextFunction) => {
		const authStr = req.headers.authorization;
		let token: string;
		if (authStr && authStr.includes('Bearer ')) {
			token = authStr.split('Bearer ').pop();
		}

		if (token) {
			const session = authService.decode(token);
			if (session && session.id) {
				// Hack: 有token的以token为准，删除cookie中存的sessionID(express-session以header中的cookie优先级为最高)
				// removeHeaderCookie(req, sessionName);
				req.signedCookies = {
					// Fix: cookie-parser Object[null property]
					...req.signedCookies,
					[sessionName]: session.id,
				};
			}
			req.customToken = token;
		}

		next();
	};
};
