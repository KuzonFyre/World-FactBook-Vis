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
Returns Kaggle DataFrame
"""
def getKaggleDataframe():
    kaggleDataSetPath = findFilePath(os.path.join("kaggleDataset", "countries.csv"))
    return pd.read_csv(kaggleDataSetPath)
    


"""
Creates a dataset of countries and their GDP
"""
def createGDP_dataset():
    df = getKaggleDataframe()
    allCols = df.columns.values.tolist()
    # print(allCols)
    for col in allCols:
        if 'GDP' in col:
            print(col)
    # Data processing 
    df = df[['Country', 'Economy: Real GDP per capita']]
    pattern = r'\$([\d,]+) \((\d{4}) est.\)' # GDP redex pattern
    df['GDP_2021'] = df['Economy: Real GDP per capita'].str.extract(pattern)[0]
    df = df.drop(columns=['Economy: Real GDP per capita'])
    df['GDP_2021'] = df['GDP_2021'].str.replace(',', '')
    print(int(df.iloc[0]['GDP_2021']))
    df['GDP_2021'] = df['GDP_2021'].astype(float)
    df = df.fillna(0)
    df = change_countryNames(df)
    print(df.info())
    df.to_csv(findFilePath(os.path.join("kaggleDataset", "parsedData", "gdpPerCapita.csv")), index=False)



"""
Change country Names to match map country names
"""
def change_countryNames(df):
    # String any " in the country names
    print(df.info())
    df['Country'] = df['Country'].str.replace('"', '')
    replace_dict = {
        'United States': 'USA',
        'United Kingdom': 'England',
        'Korea, North': 'North Korea',
        'Korea, South': 'South Korea',
        'Czechia': 'Czech Republic',
        "Turkey (Turkiye)": 'Turkey',
        'Serbia': 'Republic of Serbia',
        'North Macedonia': 'Macedonia',
        'Timor-Leste': 'East Timor',
        'Burma': 'Myanmar',
        'Falkland Islands (Islas Malvinas)': 'Falkland Islands',
        'Gambia, The': "Gambia", 
        'Guinea-Bissau': 'Guinea Bissau',
        'Congo, Republic of the': 'Republic of the Congo',
        'Congo, Democratic Republic of the': 'Democratic Republic of the Congo',
        'Tanzania': 'United Republic of Tanzania',
    }
    df['Country'] = df['Country'].replace(replace_dict)

    # Add missing countries
    
    print(df['Country'].unique())
    return df


createGDP_dataset()