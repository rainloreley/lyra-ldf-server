import express, {Response, Request} from 'express';
import * as fs from 'fs';
const path = require('path');
const app = express();

// Express configuration
app.use(require('body-parser').json({ limit: '2mb' }));

const devicesDirectory = path.join(__dirname, '../devices');

/*app.use(
	'/devices',
	express.static(devicesDirectory)
);*/

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).json({ err: 'internalError' });
});

app.get('/', (req: Request, res: Response) => {
	res.status(200).json({ message: 'This was a triumph' });
});

app.get('/list', (req: Request, res: Response) => {
	try {
		const allFileNames = fs.readdirSync(devicesDirectory);
		const allDevices: DeviceInformation[] = [];
		for (var fileName of allFileNames) {
			if (fileName.endsWith('.ldf')) {
				const filePath = path.join(devicesDirectory, fileName);
				const deviceInfo = fs.readFileSync(filePath, 'utf8');
				const parsedjson = JSON.parse(deviceInfo);
				if (
					typeof parsedjson.uuid === 'string' &&
					typeof parsedjson.device_name === 'string' &&
					typeof parsedjson.vendor === 'string'
				) {
					allDevices.push({
						uid: parsedjson.uuid,
						name: parsedjson.device_name,
						vendor: parsedjson.vendor,
						filename: fileName
					});
				}
			}
		}
		res.status(200).json(allDevices);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: 'internalError' });
	}
});

interface DeviceInformation {
	uid: string;
	vendor: string;
	name: string;
	filename: string;
}

app.listen(process.env.PORT || 3000, () => console.log('LDF server ready'));
// 404
app.use((req, res) => {
	res.status(404).json({ err: 'notFound' });
});
