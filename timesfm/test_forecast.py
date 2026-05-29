import timesfm

print("Loading TimesFM model (this downloads ~200MB)...")
model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
print("✓ Model loaded")

model.compile(timesfm.ForecastConfig(max_context=1024, max_horizon=256))
print("✓ Model compiled")

# Sample sales data
sales_data = [100, 102, 101, 105, 108, 107, 110, 112, 115, 118, 120, 123]
print(f"Input data: {sales_data}")

# Generate 12-month forecast
forecast, quantiles = model.forecast(
    horizon=12,
    inputs=[sales_data]
)

print(f"\n12-month forecast: {forecast[0].tolist()}")
print("\n✓ TimesFM is working correctly on your Mac!")
