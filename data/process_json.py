import pandas as pd
import json
import os
import re

def flatten_json(y):
    out = {}
    dataClean = ["Real GDP (purchasing power parity)",
"Real GDP growth rate",
"Real GDP per capita",
"Unemployment rate",
"Public debt",
"Current account balance",
"Exports",
"Imports",
"Debt - external",
"Exchange rates",
"Energy consumption per capita",
"Military expenditures"]
    def flatten(x, name=''):
        if x in dataClean:
            print(x)
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '_')
        elif type(x) is list:
            i = 0
            for a in x:
                flatten(a, name + str(i) + '_')
                i += 1
        else:
            matching_dataClean = next((dc for dc in dataClean if dc in name), None)
            if matching_dataClean is not None:
                out[matching_dataClean] = x
            else:
                out[name[:-1]] = x

    flatten(y)
    return out

output_csv = 'compiled_data.csv'
dirs = ['africa', 'australia-oceania', 'central-america-n-caribbean','central-asia', 'east-n-southeast-asia', 'europe', 'middle-east', 'north-america', 'south-america', 'south-asia']
# Read all JSON files and convert to pandas DataFrame
all_data = []
all_columns = set()
for d in dirs:
    for file in os.listdir(d):
        if file.endswith('.json'):
            with open(os.path.join(d, file), 'r') as f:
                data = json.load(f)
                flattened_data = flatten_json(data)
                all_data.append(flattened_data)
                all_columns.update(flattened_data.keys())
combined_df = pd.DataFrame(all_data,columns=list(all_columns))

combined_df.to_csv(output_csv, index=False)




# def combine_json_files_to_csv(json_files, csv_file):
#     all_data = []
#     all_columns = set()

#     # Process each JSON file
#     for file_path in json_files:
#         flattened_data = read_and_flatten_json(file_path)
#         all_data.append(flattened_data)
#         all_columns.update(flattened_data.columns)

#     # Create a DataFrame with all columns
#     combined_df = pd.DataFrame(columns=all_columns)

#     # Fill in data
#     for data in all_data:
#         combined_df = combined_df.append(data, sort=False)

#     # Replace missing values with 'NA'
#     combined_df.fillna('NA', inplace=True)

#     # Save to CSV
#     combined_df.to_csv(csv_file, index=False)

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
