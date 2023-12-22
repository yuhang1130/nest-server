import { Injectable, NestMiddleware } from '@nestjs/common';
import { ALSConfig, AlsSetRequest, AlsSetRequestId, ASLStore } from '../../async-storage/async-storage';
import { nanoid } from 'nanoid';

@Injectable()
export class AsyncStorageMiddleware implements NestMiddleware {
	use(req: any, res: any, next: () => void) {
		ASLStore.run({} as ALSConfig, () => {
			AlsSetRequest(req);
			AlsSetRequestId(nanoid(20));
			next();
		});
	}
}
