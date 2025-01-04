import * as UseCases from '../../../modules/use-cases';
import * as Notion from '../../../modules/data-access/notion';
import * as Cloudinary from '../../../modules/data-access/cloudinary';

export async function PATCH() {
  const images = await new UseCases.Post.UpsertImages(
    new Notion.Post.Repository(),
    new Notion.Media.Repository(),
    new Notion.Affiliate.Repository(),
    new Cloudinary.Repository()
  ).execute();

  return Response.json(images);
}
