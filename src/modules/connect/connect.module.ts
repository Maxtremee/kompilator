import { Module } from "@nestjs/common";
import { ConnectController } from "./connect.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [ConfigModule],
	controllers: [ConnectController],
})
export class ConnectModule {}
