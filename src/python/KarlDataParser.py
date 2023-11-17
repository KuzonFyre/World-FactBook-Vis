import pandas as pd 
import numpy as np
import os

"""
Finds the File Path of the dataset
"""
def findFilePath(relativePath):
    rootFolderName = "World-FactBook-Vis"
    rootDir = os.path.dirname(os.path.realpath(__file__))
    while rootDir.split('/')[-1] != rootFolderName:
        rootDir = os.path.dirname(rootDir)
    absolutePath = os.path.join(rootDir, relativePath)
    return absolutePath
    


"""
Creates a dataset of countries and their GDP
"""
kaggleDataSetPath = findFilePath(os.path.join("kaggleDataset", "countries.csv"))
print(f'kaggleDataSetPath: {kaggleDataSetPath}')
df = pd.read_csv(kaggleDataSetPath)
allCols = df.columns.values.tolist()
# print(allCols)
for col in allCols:
    if 'GDP' in col:
        print(col)
# Data processing Part 
df = df[['Country', 'Economy: Real GDP per capita']]
pattern = r'\$([\d,]+) \((\d{4}) est.\)'
df['GDP_2021'] = df['Economy: Real GDP per capita'].str.extract(pattern)[0]
df = df.drop(columns=['Economy: Real GDP per capita'])
df['GDP_2021'] = df['GDP_2021'].str.replace(',', '')
print(int(df.iloc[0]['GDP_2021']))
df['GDP_2021'] = df['GDP_2021'].astype(float)
df = df.fillna(0)
print(df.info())
df.to_csv(findFilePath(os.path.join("kaggleDataset", "parsedData", "gdpPerCapita.csv")), index=False)