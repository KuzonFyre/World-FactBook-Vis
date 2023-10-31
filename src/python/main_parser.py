"""
This parser will extract the relevant information from the countries.csv file 
while also removing unnecessary information. 
"""
import pandas as pd


# This will read the different natural resources a country has 
# I will create a drop down menu for some resources to display 
# on the map. 
df = pd.read_csv('data/countries.csv')
columns = df.columns
for col in columns:
    if 'partner' in col:
        # get the united states row
        us = df[df["Country"] == "United States"]
        us_data = us[col]
        print(us_data)
# df = df[['Country', 'Geography: Natural resources']]
# print(df.head(50))