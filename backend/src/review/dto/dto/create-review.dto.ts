export class CreateReviewDto {
  provider_id!: number;
  customer_id!: number;
  rating_stars!: number;
  feedback_text?: string;
}
