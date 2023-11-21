import pandas as pd
import pycountry

file_path = 'countries.csv'
df = pd.read_csv(file_path)
final_df = pd.DataFrame()

def get_iso_code(country_name):
    try:
        return pycountry.countries.search_fuzzy(country_name)[0].alpha_3
    except LookupError:
        return None

for country in pycountry.countries:
    print("Name:", country.name)
print(get_iso_code("The Bahamas"))
print(get_iso_code('Congo, The Democratic Republic of the'))
def extract_population(pop_string):
    # Find and extract the first numerical part
    for part in pop_string.split():
        if part.replace(',', '').replace('.', '').isdigit():
            return int(part.replace(',', ''))
    return None  # Return None if no number is found
def extract_first(gdp_string):
    if pd.isna(gdp_string):
        return None
    gdp_values = gdp_string.split(')$')
    first_gdp = gdp_values[0].split('$')[-1]
    first_gdp = first_gdp.split('(')[0].strip()
    return convert_gdp_to_number(first_gdp)

def convert_percentage(percentage_string):
    return str(percentage_string).split('%')[0]

def extract_area(area_string):
    for part in str(area_string).split():
        if part.replace(',', '').isdigit():
            return int(part.replace(',', ''))
    return None
def convert_gdp_to_number(gdp_string):
    if 'billion' in gdp_string:
        number = float(gdp_string.split(' billion')[0]) * 1e9
    elif 'million' in gdp_string:
        number = float(gdp_string.split(' million')[0]) * 1e6
    elif 'trillion' in gdp_string:
        number = float(gdp_string.split(' trillion')[0]) * 1e12
    else:
        number = gdp_string  # Assuming it's already in numeric form
    return number
def split_field(word):
  return str(word).split()[0]
print(df.columns)
final_df['Country'] = df['Country'].apply(lambda x: x.split(",")[0])
final_df['ISO Code'] = final_df['Country'].apply(get_iso_code)
final_df = final_df.dropna(subset=['ISO Code'])
final_df['GDP'] = df['Economy: Real GDP (purchasing power parity)'].apply(extract_first)
final_df['Population'] = df['People and Society: Population'].apply(extract_population)
final_df['Population growth rate'] = df['People and Society: Population growth rate'].apply(convert_percentage)
final_df['Exports'] = df['Economy: Exports'].apply(extract_first)
final_df['Current account balance'] = df['Economy: Current account balance'].apply(extract_first)
final_df['Imports'] = df['Economy: Imports'].apply(extract_first)
final_df['Mean Elevation (m)'] = df['Geography: Elevation - mean elevation'].apply(extract_area)
final_df['Coastline (km)'] = df['Geography: Coastline'].apply(extract_area)
final_df['Forest Land Use Rate'] = df['Geography: Land use - forest'].apply(convert_percentage)
final_df['Other Land Use Rate'] = df['Geography: Land use - other'].apply(convert_percentage)
final_df['Irrigated Land (sq km)'] = df['Geography: Irrigated land'].apply(extract_area)
final_df['Total area'] = df['Geography: Area - total'].apply(extract_area)
final_df['Age structure - 0-14 years Rate'] = df['People and Society: Age structure - 0-14 years'].apply(convert_percentage)
final_df['Age structure - 15-24 years Rate'] = df['People and Society: Age structure - 15-24 years'].apply(convert_percentage)
final_df['Age structure - 25-54 years Rate'] = df['People and Society: Age structure - 25-54 years'].apply(convert_percentage)
final_df['Age structure - 55-64 years Rate'] = df['People and Society: Age structure - 55-64 years'].apply(convert_percentage)
final_df['Age structure - 65 years and over Rate'] = df['People and Society: Age structure - 65 years and over'].apply(convert_percentage)
final_df['Total dependency ratio'] = df['People and Society: Dependency ratios - total dependency ratio']
final_df['Youth dependency ratio'] = df['People and Society: Dependency ratios - youth dependency ratio']
final_df['Elderly dependency ratio'] = df['People and Society: Dependency ratios - elderly dependency ratio']
final_df['Potential support ratio'] = df['People and Society: Dependency ratios - potential support ratio'].apply(split_field)
final_df['Median age'] = df['People and Society: Median age - total'].apply(split_field)
final_df['Median age - male'] = df['People and Society: Median age - male'].apply(split_field)
final_df['Median age - female'] = df['People and Society: Median age - female'].apply(split_field)
final_df['Population growth rate'] = df['People and Society: Population growth rate'].apply(convert_percentage)
final_df['Birth rate/1000 people'] = df['People and Society: Birth rate'].apply(split_field)
final_df['Death rate/1000 people'] = df['People and Society: Death rate'].apply(split_field)
final_df['Net migration rate/1000 people'] = df['People and Society: Net migration rate'].apply(split_field)
final_df['Urban Population ratio'] =df['People and Society: Urbanization - urban population'].apply(convert_percentage)
final_df['Urban population growth rate'] = df['People and Society: Urbanization - rate of urbanization'].apply(convert_percentage)
final_df['Sex ratio at birth(male/female)'] = df['People and Society: Sex ratio - at birth'].apply(split_field)
final_df['Sex ratio 0-14 years(male/female)'] = df['People and Society: Sex ratio - 0-14 years'].apply(split_field)
final_df['Sex ratio 15-24 years(male/female)'] = df['People and Society: Sex ratio - 15-24 years'].apply(split_field)
final_df['Sex ratio 25-54 years(male/female)'] = df['People and Society: Sex ratio - 25-54 years'].apply(split_field)
final_df['Sex ratio 55-64 years(male/female)'] = df['People and Society: Sex ratio - 55-64 years'].apply(split_field)
final_df['Sex ratio 65 years and over(male/female)'] = df['People and Society: Sex ratio - 65 years and over'].apply(split_field)
final_df['Sex ratio - total population(male/female)'] = df['People and Society: Sex ratio - total population'].apply(split_field)
final_df['Mother\'s mean age at first birth'] = df['People and Society: Mother\'s mean age at first birth'].apply(split_field)
final_df['Maternal mortality ratio (deaths/100,000 live births)'] = df['People and Society: Maternal mortality ratio'].apply(split_field)
final_df['Infant mortality rate (per 1000 live births)'] = df['People and Society: Infant mortality rate - total'].apply(split_field)
final_df['Infant mortality rate - male'] = df['People and Society: Infant mortality rate - male'].apply(split_field)
final_df['Infant mortality rate - female'] = df['People and Society: Infant mortality rate - female'].apply(split_field)
final_df['Life expectancy at birth (years)'] = df['People and Society: Life expectancy at birth - total population'].apply(split_field)
final_df['Life expectancy at birth - male'] = df['People and Society: Life expectancy at birth - male'].apply(split_field)
final_df['Life expectancy at birth - female'] = df['People and Society: Life expectancy at birth - female'].apply(split_field)
final_df['Fertility rate (children born/women)'] = df['People and Society: Total fertility rate'].apply(split_field)
final_df['Gross reproduction rate'] = df['People and Society: Gross reproduction rate'].apply(split_field)
final_df['Contraceptive prevalence rate'] = df['People and Society: Contraceptive prevalence rate'].apply(convert_percentage)

print(final_df)
final_df.to_csv('extracted_data.csv', index=False)