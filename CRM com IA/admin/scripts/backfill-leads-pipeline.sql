UPDATE leads l
SET
  product_id = c.product_id,
  current_stage_id = COALESCE(
    l.current_stage_id,
    (
      SELECT ps.id FROM pipeline_stages ps
      WHERE ps.product_id = c.product_id
      ORDER BY ps.order_index ASC
      LIMIT 1
    )
  )
FROM webchat_conversations c
WHERE c.lead_id = l.id
  AND c.product_id IS NOT NULL
  AND (l.product_id IS NULL OR l.current_stage_id IS NULL);
