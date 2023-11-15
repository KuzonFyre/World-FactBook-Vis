import pandas as pd
import json
import os

output_csv = 'compiled_data.csv'
dirs = ['africa', 'australia-oceania', 'central-america-n-caribbean','central-asia', 'east-n-southeast-asia', 'europe', 'middle-east', 'north-america', 'south-america', 'south-asia']
# Read all JSON files and convert to pandas DataFrame
all_data = []
for d in dirs:
    for file in os.listdir(d):
        if file.endswith('.json'):
            with open(os.path.join(d, file), 'r') as f:
                data = json.load(f)
                all_data.append(pd.DataFrame(data))

    # Concatenate all data into a single DataFrame
    final_df = pd.concat(all_data, ignore_index=True)

    # Save to CSV
    final_df.to_csv(output_csv, index=False)

# def add_country_names(csv_file, country_code_file, output_csv):
#     # Load the CSV file
#     df = pd.read_csv(csv_file)

#     # Load the country codes
#     country_codes = pd.read_csv(country_code_file)

#     # Merge the dataframes on ISO code
#     merged_df = pd.merge(df, country_codes, on='ISO_code', how='left')

#     # Save the final DataFrame
#     merged_df.to_csv(output_csv, index=False)


# # Add country names to the CSV file
# add_country_names(output_csv, country_code_file, 'final_output.csv')
