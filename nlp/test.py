# import pandas as pd

# df = pd.read_json('final.json')

# df = pd.DataFrame(df.data.values.tolist())
# print(df.head())

# df = df.drop(['id', 'withheld'], axis=1)
# label = "label"

# for i in range(0, df.shape[0]):
#     if df.iloc[i][label] == 'abusive':
#         df.iloc[i][label] = 1
#     elif df.iloc[i][label] == 'normal':
#         df.iloc[i][label] = 2
#     else:
#         df.iloc[i][label] = 0

# print(df.head())
# print(df.shape)
# df1 = pd.read_csv('labeled_data.csv')
# df1 = df1.drop(['Unnamed: 0', 'count', 'hate_speech', 'offensive_language', 'neither'], axis=1)
# df1 = df1[['tweet', 'class']]
# df1.rename(columns = {'tweet':'text', 'class':'label'}, inplace = True)
# print(df1.head())
# print(df1.shape)
# concatenated = df.append(df1, ignore_index=True)
# print(concatenated.head())
# print(concatenated.shape)
# concatenated.to_csv('final.csv')