import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Verify } from '../utils/verify';
import url = require('url');
import request = require('request-promise');
// import { ConfigService } from 'src/config.service';
import * as dotenv from 'dotenv';
import { ShopDbService } from 'src/shop-db/shop-db.service';
import { CustomCollectionService } from 'src/custom-collection/custom-collection.service';
import { CutomCollectionPostDto } from 'src/custom-collection/dto/custom-collection-post.dto';
import { ImageDto } from 'src/custom-collection/dto/image.dto';

@Injectable()
export class AuthenticationService {
  private DATABASE_USER: string;
  private SHOPIFY_API_SECRET_KEY: string;
  private SHOPIFY_API_KEY: string;
  private APP_SCOPE: string;
  private APP_DOMAIN: string;
  private verify: Verify;
  private appStoreTokenTest: string;
  public FE_DOMAIN: string;

  constructor(
    private readonly shopService: ShopDbService,
    private readonly customCollectionService: CustomCollectionService,
    // config?: ConfigService,
  ) {
    // this.DATABASE_USER = config.get('DATABASE_USER');
    this.DATABASE_USER = process.env.DATABASE_USER || require('./config');
    // this.SHOPIFY_API_SECRET_KEY = config.get('SHOPIFY_API_SECRET_KEY');
    this.SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY || require('./config');
    // this.SHOPIFY_API_KEY = config.get('SHOPIFY_API_KEY');
    this.SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || require('./config');
    // this.APP_SCOPE = config.get('APP_SCOPE');
    this.APP_SCOPE = process.env.APP_SCOPE || require('./config');
    // this.APP_DOMAIN = config.get('APP_DOMAIN');
    this.APP_DOMAIN = process.env.APP_DOMAIN || require('./config');
    // this.appStoreTokenTest = config.get('appStoreTokenTest');
    this.appStoreTokenTest = process.env.appStoreTokenTest || require('./config');
    // this.FE_DOMAIN = config.get('FE_DOMAIN');
    this.FE_DOMAIN = process.env.FE_DOMAIN || require('./config');
    // this.verify = new Verify(config);
  }

  mysteryBoxesCollectionDto(): CutomCollectionPostDto {
    const dto = new CutomCollectionPostDto();
    dto.title = 'Mystery-boxes-collection';
    dto.published = true;
    dto.image = new ImageDto();
    dto.image.src = 'https://git.io/fjsqG';
    dto.image.alt = 'Mystery boxes logo';

    return dto;
  }

  install(req: any): any {
    const shop = req.query.shop;
    const appId = this.SHOPIFY_API_KEY;

    const appSecret = this.SHOPIFY_API_SECRET_KEY;
    const appScope = this.APP_SCOPE;

    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${appId}&scope=${appScope}&redirect_uri=http://${
      this.APP_DOMAIN
      }/authentication`;

    return installUrl;
  }

  async auth(req: any): Promise<any> {
    let securityPass = false;
    const appId = this.SHOPIFY_API_KEY;
    const appSecret = this.SHOPIFY_API_SECRET_KEY;
    const shop = req.query.shop;
    const code = req.query.code;

    const regex = /^[a-z\d_.-]+[.]myshopify[.]com$/;

    if (shop.match(regex)) {
      securityPass = true;
    } else {
      securityPass = false;
    }

    const urlObj = url.parse(req.url);
    const query = urlObj.search.slice(1);
    if (this.verify.verifyHmac(query)) {
      securityPass = true;
    } else {
      securityPass = false;
    }

    if (securityPass && regex) {
      const accessTokenRequestUrl =
        'https://' + shop + '/admin/oauth/access_token';
      const accessTokenPayload = {
        client_id: appId,
        client_secret: appSecret,
        code,
      };

      return await request
        .post(accessTokenRequestUrl, { json: accessTokenPayload })
        .then(async accessTokenResponse => {
          const accessToken = accessTokenResponse.access_token;

          await this.shopService.createShopDbData(shop, accessToken);
          const result = await this.customCollectionService.createCustomCollection({ shop }, this.mysteryBoxesCollectionDto());
          const mysteryBoxCollectionId = result != null ? result.custom_collection.id : null;
          if (mysteryBoxCollectionId !== null) {
            await this.shopService.updateShopDbData(shop, mysteryBoxCollectionId.toString());
          }

          return `/authentication/app?shop=${shop}`;
        })
        .catch(error => {
          return error.statusCode;
        });
    }
    // else {
    //     res.redirect('/installerror');
    // }
  }
}
