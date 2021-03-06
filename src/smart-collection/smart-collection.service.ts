import { Injectable } from '@nestjs/common';
import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class SmartCollectionService {
  constructor(private readonly sharedService: SharedService) {}

  async getSmartCollections(queryParam: any): Promise<any> {
    const shopData = await this.sharedService.getShopAccess(queryParam);
    let options;
    if (shopData) {
      options = {
        uri: `https://${shopData.shop}/admin/smart_collections.json`,
        headers: {
          'cache-control': 'no-cache',
          'X-Shopify-Access-Token': shopData.access_token,
        },
        json: true,
      };
    }

    return await this.sharedService.requestData(options);
  }
}
