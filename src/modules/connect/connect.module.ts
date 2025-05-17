import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConnectController } from "./connect.controller";

@Module({
	imports: [ConfigModule],
	controllers: [ConnectController],
})
export class ConnectModule {}
