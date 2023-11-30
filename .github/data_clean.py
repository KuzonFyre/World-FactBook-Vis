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
def extract_comma(pop_string):
    # Find and extract the first numerical part
    for part in pop_string.split():
        if part.replace(',', '').replace('.', '').isdigit():
            return part.replace(',', '')
    return None  # Return None if no number is found
def extract_first(gdp_string):
    if pd.isna(gdp_string):
        return None
    gdp_values = gdp_string.split(')$')
    first_gdp = gdp_values[0].split('$')[-1]
    first_gdp = first_gdp.split('(')[0].strip()
    return convert_mil_to_number(first_gdp)

def convert_percentage(percentage_string):
    return str(percentage_string).replace('$','').replace(',','').split('%')[0]

def extract_area(area_string):
    for part in str(area_string).split():
        if part.replace(',', '').isdigit():
            return int(part.replace(',', ''))
    return None
def convert_mil_to_number(string):
    string = string.replace('$','').replace(',','')
    if 'billion' in string:
        number = float(string.split(' billion')[0]) * 1e9
    elif 'million' in string:
        number = float(string.split(' million')[0]) * 1e6
    elif 'trillion' in string:
        number = float(string.split(' trillion')[0]) * 1e12
    else:
        number = string.replace(',','').replace('$','')  # Assuming it's already in numeric form
    return number
def split_field(word):
  return str(word).replace('$','').replace(',','').split()[0]

def extract_three(data_str):
    # Using regular expressions to find all percentages
    percentages = re.findall(r'(\d+)%', data_str)
    
    if len(percentages) == 3:
        return percentages[:3]
    else:
        return None
print(df.columns)
final_df['Country'] = df['Country'].apply(lambda x: x.split(",")[0])
final_df['ISO Code'] = final_df['Country'].apply(get_iso_code)
final_df = final_df.dropna(subset=['ISO Code'])
final_df['GDP'] = df['Economy: Real GDP (purchasing power parity)'].apply(extract_first)
final_df['Population'] = df['People and Society: Population'].apply(extract_comma)
final_df['Population growth rate'] = df['People and Society: Population growth rate'].apply(convert_percentage)
final_df['Exports'] = df['Economy: Exports'].apply(extract_first)
final_df['Current account balance'] = df['Economy: Current account balance'].apply(extract_first)
final_df['Imports'] = df['Economy: Imports'].apply(extract_first)
final_df['Mean Elevation (m)'] = df['Geography: Elevation - mean elevation'].apply(extract_area)
final_df['Coastline (km)'] = df['Geography: Coastline'].apply(extract_area)
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

temp_df = pd.DataFrame(df['People and Society: Drinking water source - improved'].apply(extract_three).tolist(), columns=['Improved Drinking Access Urban', 'Improved Drinking Access Rural', 'Improved Drinking Access Total'])
final_df = pd.concat([final_df, temp_df], axis=1)
temp_df = pd.DataFrame(df['People and Society: Drinking water source - unimproved'].apply(extract_three).tolist(), columns=['Unimproved Drinking Access Urban', 'Unimproved Drinking Access Rural', 'Unimproved Drinking Access Total'])
final_df = pd.concat([final_df, temp_df], axis=1)
final_df['Current health expenditure (% of GDP)'] = df['People and Society: Current health expenditure'].apply(convert_percentage)
final_df['Physicians density (per 1000 people)'] = df['People and Society: Physicians density'].apply(split_field)
final_df['Hospital bed density (beds per 1000 people)'] = df['People and Society: Hospital bed density'].apply(split_field)
temp_df = pd.DataFrame(df['People and Society: Sanitation facility access - improved'].apply(extract_three).tolist(), columns=['Improved Sanitation Access Urban', 'Improved Sanitation Access Rural', 'Improved Sanitation Access Total'])
final_df = pd.concat([final_df, temp_df], axis=1)
temp_df = pd.DataFrame(df['People and Society: Sanitation facility access - unimproved'].apply(extract_three).tolist(), columns=['Unimproved Sanitation Access Urban', 'Unimproved Sanitation Access Rural', 'Unimproved Sanitation Access Total'])
final_df = pd.concat([final_df, temp_df], axis=1)
final_df['Obesity - adult prevalence rate'] = df['People and Society: Obesity - adult prevalence rate'].apply(convert_percentage)
final_df['Alcohol consumption per capita (liters of pure alcohol)'] = df['People and Society: Alcohol consumption per capita - total'].apply(split_field)
final_df['Alcohol consumption per capita - beer (liters of pure alcohol)'] = df['People and Society: Alcohol consumption per capita - beer'].apply(split_field)
final_df['Alcohol consumption per capita - wind (liters of pure alcohol)'] = df['People and Society: Alcohol consumption per capita - wine'].apply(split_field)
final_df['Alcohol consumption per capita - spiritS (liters of pure alcohol)'] = df['People and Society: Alcohol consumption per capita - spiritS'].apply(split_field)
final_df['Alcohol consumption per capita - other alcohols (liters of pure alcohol)'] = df['People and Society: Alcohol consumption per capita - other alcohols'].apply(split_field)
final_df['Tobacco use rate'] = df['People and Society: Tobacco use - total'].apply(convert_percentage)
final_df['Tobacco use rate - male'] = df['People and Society: Tobacco use - male'].apply(convert_percentage)
final_df['Tobacco use rate - female'] = df['People and Society: Tobacco use - female'].apply(convert_percentage)
final_df['Children under 5 years underweight rate'] = df['People and Society: Children under the age of 5 years underweight'].apply(convert_percentage)
final_df['Married women (ages 15-49) rate'] = df['People and Society: Currently married women (ages 15-49)'].apply(convert_percentage)
final_df['Women married by age 15 rate'] = df['People and Society: Child marriage - women married by age 15'].apply(convert_percentage)
final_df['Women married by age 18 rate'] = df['People and Society: Child marriage - women married by age 18'].apply(convert_percentage)
final_df['Education expenditures (% of GDP)'] = df['People and Society: Education expenditures'].apply(convert_percentage)
final_df['Literacy rate'] = df['People and Society: Literacy - total population'].apply(convert_percentage)
final_df['Literacy rate - male'] = df['People and Society: Literacy - male'].apply(convert_percentage)
final_df['Literacy rate - female'] = df['People and Society: Literacy - female'].apply
final_df['School life expectancy'] = df['People and Society: School life expectancy (primary to tertiary education) - total'].apply(split_field)
final_df['School life expectancy - male'] = df['People and Society: School life expectancy (primary to tertiary education) - male'].apply(split_field)
final_df['School life expectancy - female'] = df['People and Society: School life expectancy (primary to tertiary education) - female'].apply(split_field)
final_df['Youth unemployment rate (ages 15-24)'] = df['People and Society: Youth unemployment rate (ages 15-24) - total'].apply(convert_percentage)
final_df['Youth unemployment rate (ages 15-24) - male'] = df['People and Society: Youth unemployment rate (ages 15-24) - male'].apply(convert_percentage)
final_df['Youth unemployment rate (ages 15-24) - female'] = df['People and Society: Youth unemployment rate (ages 15-24) - female'].apply(convert_percentage)

final_df['Forest land (% of land area)'] = df['Environment: Land use - forest)'].apply(convert_percentage)
final_df['Agricultural land (% of land area)'] = df['Environment: Land use - agricultural land'].apply(convert_percentage)
final_df['Other land (% of land area)'] = df['Environment: Land use - other land'].apply(convert_percentage)
final_df['Revenue from forest resources (% of GDP)'] = df['Environment: Revenue from forest resources'].apply(convert_percentage)
final_df['Revenue from coal (% of GDP)'] = df['Environment: Revenue from coal'].apply(convert_percentage)
final_df['Particulate matter emissions (micrograms per cubic meter)'] = df['Environment: Air pollutants - particulate matter emissions'].apply(split_field)
final_df['Carbon dioxide emissions (megatons)'] = df['Environment: Air pollutants - carbon dioxide emissions'].apply(split_field)
final_df['Methane emissions (megatons)'] = df['Environment: Air pollutants - methane emissions'].apply(split_field)
final_df['Annual municipal solid waste (tons)'] = df['Environment: Waste and recycling - municipal solid waste generated annually'].apply(extract_comma)
final_df['Municipal water withdrawal (cubic meters)'] = df['Environment: Total water withdrawal - municipal'].apply(convert_mil_to_number)
final_df['Industrial water withdrawal (cubic meters)'] = df['Environment: Total water withdrawal - industrial'].apply(convert_mil_to_number)
final_df['Agricultural water withdrawal (cubic meters)'] = df['Environment: Total water withdrawal - agricultural'].apply(convert_mil_to_number)
final_df['Renewable water resources (cubic meters)'] = df['Environment: Total renewable water resources'].apply(convert_mil_to_number)
final_df['GDP growth rate'] = df['Economy: Real GDP growth rate'].apply(convert_percentage)
final_df['GDP per capita growth rate'] = df['Economy: Real GDP per capita'].apply(split_field)
final_df['GDP (official exchange rate)'] = df['Economy: GDP (official exchange rate)'].apply(convert_mil_to_number)
final_df['Inflation rate'] = df['Economy: Inflation rate (consumer prices)'].apply(convert_percentage)
final_df['GDP by sector agriculture composition'] = df['Economy: GDP - composition, by sector of origin - agriculture'].apply(convert_percentage)
final_df['GDP by sector industry composition'] = df['Economy: GDP - composition, by sector of origin - industry'].apply(convert_percentage)
final_df['GDP by sector services composition'] = df['Economy: GDP - composition, by sector of origin - services'].apply(convert_percentage)
final_df['GDP by end use household composition'] = df['Economy: GDP - composition, by end use - household consumption'].apply(convert_percentage)
final_df['GDP by end use government composition'] = df['Economy: GDP - composition, by end use - government consumption'] = df['Economy: GDP - composition, by end use - government consumption'].apply(convert_percentage)
final_df['GDP by end use fixed capital investment composition'] = df['Economy: GDP - composition, by end use - investment in fixed capital'].apply(convert_percentage)
final_df['GDP by end use inventories investment composition'] = df['Economy: GDP - composition, by end use - investment in inventories'].apply(convert_percentage)
final_df['GDP by end use exports composition'] = df['Economy: GDP - composition, by end use - exports of goods and services'].apply(convert_percentage)
final_df['GDP by end use - imports composition'] = df['Economy: GDP - composition, by end use - imports of goods and services'].apply(convert_percentage)
final_df['Industrial production growth rate'] = df['Economy: Industrial production growth rate'].apply(convert_percentage)
final_df['Labor force'] = df['Economy: Labor force'].apply(convert_mil_to_number)
final_df['Agriculture labor force'] = df['Economy: Labor force - by occupation - agriculture'].apply(convert_percentage)
final_df['Industry labor force'] = df['Economy: Labor force - by occupation - industry'].apply(convert_percentage)
final_df['Services labor force'] = df['Economy: Labor force - by occupation - services'].apply(convert_percentage)
final_df['Unemployment rate'] = df['Economy: Unemployment rate'].apply(convert_percentage)
final_df['Population below poverty line'] = df['Economy: Population below poverty line'].apply(convert_percentage)
final_df['Gini Index coefficient'] = df['Economy: Gini Index coefficient - distribution of family income'].apply(split_field)
final_df['Household income(Lowest 10%) by percentage share'] = df['Economy: Household income or consumption by percentage share - lowest 10%'].apply(convert_percentage)
final_df['Household income(Highest 10%) by percentage share'] = df['Economy: Household income or consumption by percentage share - highest 10%'].apply(convert_percentage)
final_df['Revenues'] = df['Economy: Budget - revenues'].apply(convert_mil_to_number)
final_df['Expenditures'] = df['Economy: Budget - expenditures'].apply(convert_mil_to_number)
final_df['Budget Balance (% of GDP)'] = df['Economy: Budget surplus (+) or deficit (-)'].apply(convert_percentage)
final_df['Public debt (% of GDP)'] = df['Economy: Public debt'].apply(convert_percentage)
final_df['Taxes and other revenues (% of GDP)'] = df['Economy: Taxes and other revenues'].apply(convert_percentage)
final_df['Current account balance (% of GDP)'] = df['Economy: Current account balance'].apply(convert_mil_to_number)
# Economy: Exports - partners
# Economy: Imports - partners
final_df['Currency and gold reserves'] = df['Economy: Reserves of foreign exchange and gold'].apply(convert_mil_to_number)
final_df['External debt'] = df['Economy: Debt - external'].apply(convert_mil_to_number)
final_df['Exchange rates to USD'] = df['Economy: Exchange rates - Exchange rates'].apply(split_field)
final_df['Electricity access rate'] = df['Energy: Electricity access - electrification - total population'].apply(convert_percentage)
final_df['Electricity access rate - rural'] = df['Energy: Electricity access - electrification - rural areas'].apply(convert_percentage)
final_df['Electricity access rate - urban'] = df['Energy: Electricity access - electrification - urban areas'].apply(convert_percentage)
final_df['Electricity installed capacity (kW)'] = df['Energy: Electricity - installed generating capacity'].apply(convert_mil_to_number)
final_df['Electricity consumption (kWh)'] = df['Energy: Electricity - consumption'].apply(convert_mil_to_number)
final_df['Electricity exports (kWh)'] = df['Energy: Electricity - exports'].apply(convert_mil_to_number)
final_df['Electricity imports (kWh)'] = df['Energy: Electricity - imports'].apply(convert_mil_to_number)
final_df['Electricity transmission losses (kWh)'] = df['Energy: Electricity - transmission/distribution losses'].apply(convert_mil_to_number)
final_df['Electricity fossil fuel generation (% of total capacity)'] = df['Energy: Electricity generation sources - fossil fuels'].apply(convert_percentage)
final_df['Electricity nuclear generation (% of total capacity)'] = df['Energy: Electricity generation sources - nuclear'].apply(convert_percentage)
final_df['Electricity hydro generation (% of total capacity)'] = df['Energy: Electricity generation sources - hydroelectricity'].apply(convert_percentage)
final_df['Electricity wind generation (% of total capacity)'] = df['Energy: Electricity generation sources - wind'].apply(convert_percentage)
final_df['Electricity solar generation (% of total capacity)'] = df['Energy: Electricity generation sources - solar'].apply(convert_percentage)
final_df['Electricity geothermal generation (% of total capacity)'] = df['Energy: Electricity generation sources - geothermal'].apply(convert_percentage)
final_df['Electricity tide and wave generation'] = df['Energy: Electricity generation sources - tide and wave'].apply(convert_percentage)
final_df['Electricity biomass and waste generation (% of total capacity)'] = df['Energy: Electricity generation sources - biomass and waste'].apply(convert_percentage)
final_df['Coal production (metric tons)'] = df['Energy: Coal - production'].apply(convert_mil_to_number)
final_df['Coal consumption (metric tons)'] = df['Energy: Coal - consumption'].apply(convert_mil_to_number)
final_df['Coal exports (metric tons)'] = df['Energy: Coal - exports'].apply(convert_mil_to_number)
final_df['Coal imports (metric tons)'] = df['Energy: Coal - imports'].apply(convert_mil_to_number)
final_df['Coal reserves (metric tons)'] = df['Energy: Coal - proven reserves'].apply(convert_mil_to_number)
final_df['Petroleum production (bbl/day)'] = df['Energy: Petroleum - total petroleum production'].apply(split_field)
final_df['Petroleum consumption (bbl/day)'] = df['Energy: Petroleum - refined petroleum consumption'].apply(split_field)
final_df['Petroleum exports (bbl/day)'] = df['Energy: Petroleum - crude oil and lease condensate exports'].apply(split_field)
final_df['Petroleum imports (bbl/day)'] = df['Energy: Petroleum - crude oil and lease condensate imports'].apply(split_field)
final_df['Petroleum reserves (barrels)'] = df['Energy: Petroleum - proven reserves'].apply(convert_mil_to_number)
final_df['Refined petroleum products production (bbl/day)'] = df['Energy: Refined petroleum products - production'].apply(split_field)
final_df['Refined petroleum products exports (bbl/day)'] = df['Energy: Refined petroleum products - exports'].apply(split_field)
final_df['Refined petroleum products imports (bbl/day)'] = df['Energy: Refined petroleum products - imports'].apply(split_field)
final_df['Natural gas production (cubic meters)'] = df['Energy: Natural gas - production'].apply(convert_mil_to_number)
final_df['Natural gas consumption (cubic meters)'] = df['Energy: Natural gas - consumption'].apply(convert_mil_to_number)
final_df['Natural gas exports (cubic meters)'] = df['Energy: Natural gas - exports'].apply(convert_mil_to_number)
final_df['Natural gas imports (cubic meters)'] = df['Energy: Natural gas - imports'].apply(convert_mil_to_number)
final_df['Natural gas reserves (cubic meters)'] = df['Energy: Natural gas - proven reserves'].apply(convert_mil_to_number)
final_df['Energy: Carbon dioxide emissions (metric tonnes)'] = df['Energy: Carbon dioxide emissions'].apply(convert_mil_to_number)
final_df['Coal emissions (metric tonnes)'] = df['Energy: Carbon dioxide emissions - from coal and metallurgical coke'].apply(convert_mil_to_number)
final_df['Petroleum emissions (metric tonnes)'] = df['Energy: Carbon dioxide emissions - from petroleum and other liquids'].apply(convert_mil_to_number)
final_df['Gas emissions (metric tonnes)'] = df['Energy: Carbon dioxide emissions - from consumed natural gas'].apply(convert_mil_to_number)
final_df['Energy consumption per capita (Btu/preson)'] = df['Energy: Energy consumption per capita'].apply(convert_mil_to_number)
final_df['Telephone fixed line subscriptions (per 100 people)'] = df['Communications: Telephones - fixed lines - subscriptions per 100 inhabitants'].apply(split_field)
final_df['Telephone mobile subscriptions (per 100 people)'] = df['Communications: Telephones - mobile cellular - subscriptions per 100 inhabitants'].apply(split_field)
final_df['Internet users/total population'] = df['Communications: Internet users - percent of population'].apply(convert_percentage)
final_df['Broadband fixed subscriptions (per 100 people)'] = df['Communications: Broadband - fixed subscriptions - subscriptions per 100 inhabitants'].apply(split_field)
final_df['Registered air carriers'] = df['Transportation: National air transport system - number of registered air carriers'].apply(split_field)
final_df['Inventory of registered aircraft'] = df['Transportation: National air transport system - inventory of registered aircraft operated by air carriers']
final_df['Annual passenger traffic on air carriers'] = df['Transportation: National air transport system - annual passenger traffic on registered air carriers'].apply(convert_mil_to_number)
final_df['Annual freight traffic on air carriers (mt-km)'] = df['Transportation: National air transport system - annual freight traffic on registered air carriers'].apply(convert_mil_to_number)
final_df['Airports'] = df['Transportation: Airports'].apply(split_field)
final_df['Airports with paved runways'] = df['Transportation: Airports - with paved runways'].apply(split_field)
final_df['Airports with unpaved runways'] = df['Transportation: Airports - with unpaved runways'].apply(split_field)
final_df['Heliports'] = df['Transportation: Heliports'].apply(split_field)
final_df['Total Roadways (km)'] = df['Transportation: Roadways - total'].apply(convert_mil_to_number)
final_df['Paved Roadways (km)'] = df['Transportation: Roadways - paved'].apply(convert_mil_to_number)
final_df['Unpaved Roadways (km)'] = df['Transportation: Roadways - unpaved'].apply(convert_mil_to_number)
final_df['Military expenditures (% of GDP)'] = df['Military and Security: Military expenditures'].apply(convert_percentage)

final_df.to_csv('extracted_data.csv', index=False)