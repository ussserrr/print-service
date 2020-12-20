const ru = new Map([
  ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'],
  ['є', 'e'], ['ё', 'e'], ['ж', 'j'], ['з', 'z'], ['и', 'i'], ['ї', 'yi'], ['й', 'i'],
  ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'], ['п', 'p'], ['р', 'r'],
  ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['х', 'h'], ['ц', 'c'], ['ч', 'ch'],
  ['ш', 'sh'], ['щ', 'shch'], ['ы', 'y'], ['э', 'e'], ['ю', 'u'], ['я', 'ya']
]);


export function ruToEn(input: string): string {

  input = input.replace(/[ъь]+/g, '');

  return Array.from(input)
    .reduce((result, symbol) =>
      result + (
          ru.get(symbol)
          || ru.get(symbol.toLowerCase()) === undefined && symbol
          || ru.get(symbol.toLowerCase())!.toUpperCase()
        )
      , '');
}
