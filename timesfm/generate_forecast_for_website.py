import timesfm
import json
from datetime import datetime, timedelta

# Load and compile the model
model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
model.compile(timesfm.ForecastConfig(max_context=1024, max_horizon=256))

# Replace this with YOUR actual sales data
sales_data = [100, 102, 101, 105, 108, 107, 110, 112, 115, 118, 120, 123]

# Generate forecast
forecast, _ = model.forecast(horizon=12, inputs=[sales_data])

# Create output for your website
output = {
    "historical": sales_data,
    "forecast": forecast[0].tolist(),
    "last_updated": datetime.now().isoformat(),
    "model": "TimesFM 2.5"
}

# Save to JSON file
with open("forecast_output.json", "w") as f:
    json.dump(output, f, indent=2)

print("✓ Forecast saved to forecast_output.json")
print("You can now read this file from your Node.js app")
