import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CutomCollectionPostDto } from './dto/custom-collection-post.dto';
import { SharedService } from 'src/shared/shared.service';
var request = require('request-promise');

@Injectable()
export class CustomCollectionService {
  constructor(private readonly sharedService: SharedService) {}

  async getCustomCollections(queryParam: any): Promise<any> {
    const shopData = await this.sharedService.getShopAccess(queryParam);

    if (shopData) {
      var options = {
        uri: `https://${shopData.shop}/admin/custom_collections.json`,
        headers: {
          'cache-control': 'no-cache',
          'X-Shopify-Access-Token': shopData.access_token,
        },
      };
    }

    return await this.sharedService.requestData(options);
  }

  async createCustomCollection(
    customCollectionPostDto: CutomCollectionPostDto,
    queryParam: any,
  ): Promise<any> {
    const shopData = await this.sharedService.getShopAccess(queryParam);

    if (shopData) {
      var options = {
        method: 'POST',
        uri: `https://${shopData.shop}/admin/custom_collections.json`,
        body: {
          custom_collection: {
            title: customCollectionPostDto.title,
          },
        },
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