import { IUserContext } from '@/shared/utils/rest-api/types';
import { VisaSubmissionEntity } from '../../../pilgrim/submission/domain/submission.entity';
import { FlightManifestDto, HotelManifestDto, TransportationManifestDto } from '../dto/manifest.dto';

export interface IManifestUseCase {
  addFlightManifest(id: string, dto: FlightManifestDto[], ctx: IUserContext): Promise<VisaSubmissionEntity>;
  addHotelManifest(id: string, dto: HotelManifestDto[], ctx: IUserContext): Promise<VisaSubmissionEntity>;
  addTransportManifest(id: string, dto: TransportationManifestDto[], ctx: IUserContext): Promise<VisaSubmissionEntity>;
}
