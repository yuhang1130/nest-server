import { Injectable, NestMiddleware } from '@nestjs/common';
import {
	ALSConfig,
	AlsSetRequest,
	AlsSetRequestId,
	AlsSetRequestIp,
	ASLStore,
} from '../../async-storage/async-storage';
import { nanoid } from 'nanoid';
import { CustomRequest } from '../session-store/session-dto';

@Injectable()
export class AsyncStorageMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: any, next: () => void) {
		ASLStore.run({} as ALSConfig, () => {
			const ip =
				(req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress || req.socket.remoteAddress;
			AlsSetRequest(req);
			AlsSetRequestId(nanoid(20));
			AlsSetRequestIp(ip);
			next();
		});
	}
}
